import { BillingCycle } from '../../shared/BillingCycle';
import type { BillingCycleUnit } from '../../shared/BillingCycle';
import { PlanId } from '../../shared/PlanId';
import { Price } from '../../shared/Price';

interface PlanProps {
  readonly id: PlanId;
  name: string;
  description?: string;
  price: Price;
  readonly billingCycle: BillingCycle;
  readonly createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface PlanCreateProps {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  billingCycleUnit: BillingCycleUnit;
  billingCycleInterval?: number;
  createdAt?: Date;
  isActive?: boolean;
}

export interface PlanPrimitives {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  billingCycleUnit: BillingCycleUnit;
  billingCycleInterval: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Plan {
  private constructor(private readonly props: PlanProps) {}

  static create(props: PlanCreateProps): Plan {
    const name = Plan.ensureName(props.name);
    const description = Plan.normalizeDescription(props.description);
    const price = Price.create(props.amount, props.currency);
    const billingCycle = BillingCycle.create(
      props.billingCycleUnit,
      props.billingCycleInterval ?? 1
    );
    const createdAt = props.createdAt ?? new Date();

    return new Plan({
      id: PlanId.create(props.id),
      name,
      description,
      price,
      billingCycle,
      createdAt,
      updatedAt: createdAt,
      isActive: props.isActive ?? true
    });
  }

  static fromPrimitives(primitives: PlanPrimitives): Plan {
    return new Plan({
      id: PlanId.create(primitives.id),
      name: Plan.ensureName(primitives.name),
      description: Plan.normalizeDescription(primitives.description),
      price: Price.create(primitives.amount, primitives.currency),
      billingCycle: BillingCycle.create(
        primitives.billingCycleUnit,
        primitives.billingCycleInterval
      ),
      isActive: primitives.isActive,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt
    });
  }

  get id(): string {
    return this.props.id.toString();
  }

  get planId(): PlanId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get price(): Price {
    return this.props.price;
  }

  get amount(): number {
    return this.props.price.amount;
  }

  get currency(): string {
    return this.props.price.currency;
  }

  get billingCycle(): BillingCycle {
    return this.props.billingCycle;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  rename(newName: string): void {
    this.props.name = Plan.ensureName(newName);
    this.touch();
  }

  updateDescription(description?: string): void {
    this.props.description = Plan.normalizeDescription(description);
    this.touch();
  }

  updatePrice(amount: number, currency: string): void {
    this.props.price = Price.create(amount, currency);
    this.touch();
  }

  deactivate(): void {
    if (!this.props.isActive) {
      return;
    }

    this.props.isActive = false;
    this.touch();
  }

  activate(): void {
    if (this.props.isActive) {
      return;
    }

    this.props.isActive = true;
    this.touch();
  }

  toPrimitives(): PlanPrimitives {
    return {
      id: this.id,
      name: this.props.name,
      description: this.props.description,
      amount: this.amount,
      currency: this.currency,
      billingCycleUnit: this.props.billingCycle.unit,
      billingCycleInterval: this.props.billingCycle.interval,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt
    };
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  private static ensureName(name: string): string {
    if (!name || name.trim().length === 0) {
      throw new Error('Plan name cannot be empty.');
    }

    return name.trim();
  }

  private static normalizeDescription(description?: string): string | undefined {
    if (!description) {
      return undefined;
    }

    const trimmed = description.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
}
