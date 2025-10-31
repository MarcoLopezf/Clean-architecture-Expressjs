import { Subscription } from '../../../domain/entities/subscriptions/Subscription';
import { SubscriptionId } from '../../../domain/shared/SubscriptionId';
import { SubscriptionCancelledEvent } from '../../../domain/events/SubscriptionCancelledEvent';
import {
  CancelSubscriptionRequestDto,
  SubscriptionDto
} from '../../dtos/subscriptions';
import { SubscriptionRepository } from '../../ports/subscription.repository';
import { EventPublisher } from '../../ports/event.publisher';

export class CancelSubscriptionUseCase {
  constructor(
    private readonly subscriptions: SubscriptionRepository,
    private readonly events: EventPublisher
  ) {}

  async execute(request: CancelSubscriptionRequestDto): Promise<SubscriptionDto> {
    const subscription = await this.ensureSubscriptionExists(request.subscriptionId);

    subscription.cancel(request.effectiveDate);
    await this.subscriptions.update(subscription);

    await this.events.publish(
      SubscriptionCancelledEvent.create({
        subscriptionId: SubscriptionId.create(subscription.id),
        effectiveDate: subscription.endDate
      })
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
