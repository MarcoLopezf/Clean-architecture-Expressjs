import { SubscriptionRepository } from '../../ports/subscription.repository';
import { SubscriptionId } from '../../../domain/shared/SubscriptionId';
import type { Subscription } from '../../../domain/entities/subscriptions/Subscription';
import type { SubscriptionDto } from '../../dtos/subscriptions';

export class GetSubscriptionByIdUseCase {
  constructor(private readonly subscriptions: SubscriptionRepository) {}

  async execute(subscriptionId: string): Promise<SubscriptionDto> {
    const subscription = await this.subscriptions.findById(
      SubscriptionId.create(subscriptionId)
    );

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return this.toDto(subscription);
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
