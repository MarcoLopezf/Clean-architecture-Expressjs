import { Subscription } from '../../../domain/entities/subscriptions/Subscription';
import { UserId } from '../../../domain/shared/UserId';
import { PlanId } from '../../../domain/shared/PlanId';
import { SubscriptionId } from '../../../domain/shared/SubscriptionId';
import { SubscriptionCreatedEvent } from '../../../domain/events/SubscriptionCreatedEvent';
import {
  CreateSubscriptionRequestDto,
  CreateSubscriptionResponseDto,
  SubscriptionDto
} from '../../dtos/subscriptions';
import { SubscriptionRepository } from '../../ports/subscription.repository';
import { PlanRepository } from '../../ports/plan.repository';
import { PaymentGateway } from '../../ports/payment.gateway';
import { EventPublisher } from '../../ports/event.publisher';
import { UserRepository } from '../../ports/user.repository';
import { IdGenerator } from '../../ports/id-generator';

export class CreateSubscriptionUseCase {
  constructor(
    private readonly subscriptions: SubscriptionRepository,
    private readonly plans: PlanRepository,
    private readonly users: UserRepository,
    private readonly paymentGateway: PaymentGateway,
    private readonly events: EventPublisher,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(request: CreateSubscriptionRequestDto): Promise<CreateSubscriptionResponseDto> {
    const user = await this.ensureUserExists(request.userId);
    const plan = await this.ensurePlanExists(request.planId);

    const subscriptionId = this.idGenerator.generate();
    const subscription = Subscription.create({
      id: subscriptionId,
      userId: user.id,
      plan,
      startDate: request.startDate
    });

    await this.subscriptions.save(subscription);

    await this.paymentGateway.charge({
      id: this.idGenerator.generate(),
      subscriptionId,
      amount: plan.amount,
      currency: plan.currency,
      createdAt: new Date()
    });

    subscription.activate();
    await this.subscriptions.update(subscription);

    await this.events.publish(
      SubscriptionCreatedEvent.create({
        subscriptionId: SubscriptionId.create(subscription.id),
        userId: subscription.userId,
        planId: subscription.plan.id
      })
    );

    return {
      subscription: this.toDto(subscription)
    };
  }

  private async ensureUserExists(userId: string) {
    const user = await this.users.findById(UserId.create(userId));
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  private async ensurePlanExists(planId: string) {
    const plan = await this.plans.findById(PlanId.create(planId));
    if (!plan) {
      throw new Error('Plan not found');
    }
    return plan;
  }

  private toDto(subscription: Subscription): SubscriptionDto {
    return {
      id: subscription.id,
      userId: subscription.userId,
      planId: subscription.plan.id,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate
    };
  }
}
