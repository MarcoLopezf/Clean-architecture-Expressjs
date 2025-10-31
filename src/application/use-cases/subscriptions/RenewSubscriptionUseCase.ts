import { Subscription } from '../../../domain/entities/subscriptions/Subscription';
import { SubscriptionId } from '../../../domain/shared/SubscriptionId';
import { SubscriptionRenewedEvent } from '../../../domain/events/SubscriptionRenewedEvent';
import { SubscriptionStatusValue } from '../../../domain/shared/SubscriptionStatus';
import {
  RenewSubscriptionRequestDto,
  SubscriptionDto
} from '../../dtos/subscriptions';
import { SubscriptionRepository } from '../../ports/subscription.repository';
import { PaymentGateway } from '../../ports/payment.gateway';
import { EventPublisher } from '../../ports/event.publisher';
import { IdGenerator } from '../../ports/id-generator';

export class RenewSubscriptionUseCase {
  constructor(
    private readonly subscriptions: SubscriptionRepository,
    private readonly paymentGateway: PaymentGateway,
    private readonly events: EventPublisher,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(request: RenewSubscriptionRequestDto): Promise<SubscriptionDto> {
    const subscription = await this.ensureSubscriptionExists(request.subscriptionId);

    if (subscription.status !== SubscriptionStatusValue.ACTIVE) {
      throw new Error('Only active subscriptions can be renewed.');
    }

    await this.paymentGateway.charge({
      id: this.idGenerator.generate(),
      subscriptionId: subscription.id,
      amount: subscription.plan.amount,
      currency: subscription.plan.currency,
      createdAt: new Date()
    });

    subscription.renew(request.effectiveDate);
    await this.subscriptions.update(subscription);

    await this.events.publish(
      SubscriptionRenewedEvent.create(SubscriptionId.create(subscription.id))
    );

    return this.toDto(subscription);
  }

  private async ensureSubscriptionExists(id: string): Promise<Subscription> {
    const subscription = await this.subscriptions.findById(SubscriptionId.create(id));
    if (!subscription) {
      throw new Error('Subscription not found');
    }
    return subscription;
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
