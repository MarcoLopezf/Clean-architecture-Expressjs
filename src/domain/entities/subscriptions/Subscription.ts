import { SubscriptionId } from '../../shared/SubscriptionId';
import {
  SubscriptionStatus,
  SubscriptionStatusValue
} from '../../shared/SubscriptionStatus';
import { UserId } from '../../shared/UserId';
import { Plan, type PlanPrimitives } from '../plans/Plan';

interface SubscriptionProps {
  readonly id: SubscriptionId;
  readonly userId: UserId;
  plan: Plan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
}

export interface SubscriptionCreateProps {
  id: string;
  userId: string;
  plan: Plan;
  startDate?: Date;
  endDate?: Date;
  status?: SubscriptionStatusValue;
}

export interface SubscriptionPrimitives {
  id: string;
  userId: string;
  plan: PlanPrimitives;
  status: SubscriptionStatusValue;
  startDate: Date;
  endDate: Date;
}

export class Subscription {
  private constructor(private readonly props: SubscriptionProps) {}

  static create(props: SubscriptionCreateProps): Subscription {
    const id = SubscriptionId.create(props.id);
    const userId = UserId.create(props.userId);
    const status = Subscription.resolveStatus(props.status);
    const startDate = Subscription.cloneDate(props.startDate ?? new Date());
    const endDate = props.endDate
      ? Subscription.cloneDate(props.endDate)
      : Subscription.calculateEndDate(startDate, props.plan);

    Subscription.ensureDates(startDate, endDate);

    return new Subscription({
      id,
      userId,
      plan: props.plan,
      status,
      startDate,
      endDate
    });
  }

  static fromPrimitives(primitives: SubscriptionPrimitives): Subscription {
    const plan = Plan.fromPrimitives(primitives.plan);

    Subscription.ensureDates(primitives.startDate, primitives.endDate);

    return new Subscription({
      id: SubscriptionId.create(primitives.id),
      userId: UserId.create(primitives.userId),
      plan,
      status: SubscriptionStatus.create(primitives.status),
      startDate: Subscription.cloneDate(primitives.startDate),
      endDate: Subscription.cloneDate(primitives.endDate)
    });
  }

  get id(): string {
    return this.props.id.toString();
  }

  get subscriptionId(): SubscriptionId {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId.toString();
  }

  get ownerId(): UserId {
    return this.props.userId;
  }

  get plan(): Plan {
    return this.props.plan;
  }

  get status(): SubscriptionStatusValue {
    return this.props.status.toString();
  }

  get subscriptionStatus(): SubscriptionStatus {
    return this.props.status;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  isActive(): boolean {
    return this.props.status.equals(SubscriptionStatus.ACTIVE);
  }

  isPaused(): boolean {
    return this.props.status.equals(SubscriptionStatus.PAUSED);
  }

  isCancelled(): boolean {
    return this.props.status.equals(SubscriptionStatus.CANCELLED);
  }

  renew(effectiveDate?: Date): void {
    if (this.isCancelled()) {
      throw new Error('Cannot renew a cancelled subscription.');
    }

    const newStart = Subscription.cloneDate(
      effectiveDate ?? this.props.endDate
    );

    if (newStart < this.props.startDate) {
      throw new Error('Renewal date cannot be before the current start date.');
    }

    const newEnd = Subscription.calculateEndDate(newStart, this.props.plan);
    Subscription.ensureDates(newStart, newEnd);

    this.props.startDate = newStart;
    this.props.endDate = newEnd;
    this.props.status = SubscriptionStatus.ACTIVE;
  }

  cancel(effectiveDate: Date = new Date()): void {
    if (this.isCancelled()) {
      return;
    }

    if (effectiveDate < this.props.startDate) {
      throw new Error('Cancellation date cannot be before the start date.');
    }

    this.props.endDate = Subscription.cloneDate(effectiveDate);
    this.props.status = SubscriptionStatus.CANCELLED;
  }

  pause(): void {
    if (this.isCancelled()) {
      throw new Error('Cannot pause a cancelled subscription.');
    }

    if (this.isPaused()) {
      return;
    }

    this.props.status = SubscriptionStatus.PAUSED;
  }

  resume(): void {
    if (this.isCancelled()) {
      throw new Error('Cannot resume a cancelled subscription.');
    }

    if (this.isActive()) {
      return;
    }

    this.props.status = SubscriptionStatus.ACTIVE;
  }

  changePlan(newPlan: Plan, effectiveDate?: Date): void {
    if (this.isCancelled()) {
      throw new Error('Cannot change plan on a cancelled subscription.');
    }

    const changeDate = Subscription.cloneDate(
      effectiveDate ?? this.props.startDate
    );

    if (changeDate < this.props.startDate) {
      throw new Error('Plan change date cannot be before the current start date.');
    }

    this.props.plan = newPlan;

    const recalculatedEnd = Subscription.calculateEndDate(
      changeDate,
      this.props.plan
    );
    this.props.startDate = changeDate;
    this.props.endDate = recalculatedEnd;
  }

  toPrimitives(): SubscriptionPrimitives {
    return {
      id: this.id,
      userId: this.userId,
      plan: this.props.plan.toPrimitives(),
      status: this.props.status.toString(),
      startDate: this.props.startDate,
      endDate: this.props.endDate
    };
  }

  private static resolveStatus(status?: SubscriptionStatusValue): SubscriptionStatus {
    if (!status) {
      return SubscriptionStatus.ACTIVE;
    }

    switch (status) {
      case SubscriptionStatusValue.ACTIVE:
        return SubscriptionStatus.ACTIVE;
      case SubscriptionStatusValue.PAUSED:
        return SubscriptionStatus.PAUSED;
      case SubscriptionStatusValue.CANCELLED:
        return SubscriptionStatus.CANCELLED;
      default:
        return SubscriptionStatus.create(status);
    }
  }

  private static ensureDates(startDate: Date, endDate: Date): void {
    if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
      throw new Error('Subscription start date must be a valid date.');
    }

    if (!(endDate instanceof Date) || Number.isNaN(endDate.getTime())) {
      throw new Error('Subscription end date must be a valid date.');
    }

    if (endDate <= startDate) {
      throw new Error('Subscription end date must be after the start date.');
    }
  }

  private static calculateEndDate(startDate: Date, plan: Plan): Date {
    const cycle = plan.billingCycle;
    const result = new Date(startDate.getTime());
    const interval = cycle.interval;

    switch (cycle.unit) {
      case 'day':
        result.setDate(result.getDate() + interval);
        break;
      case 'week':
        result.setDate(result.getDate() + interval * 7);
        break;
      case 'month':
        result.setMonth(result.getMonth() + interval);
        break;
      case 'year':
        result.setFullYear(result.getFullYear() + interval);
        break;
      default:
        throw new Error(`Unsupported billing cycle unit: ${cycle.unit}`);
    }

    return result;
  }

  private static cloneDate(date: Date): Date {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new Error('Provided value is not a valid date.');
    }

    return new Date(date.getTime());
  }
}
