import { SubscriptionRepository } from '../../ports/subscription.repository';
import type { SubscriptionDto } from '../../dtos/subscriptions';
import type { Subscription } from '../../../domain/entities/subscriptions/Subscription';

export class ListSubscriptionsUseCase {
  constructor(private readonly subscriptions: SubscriptionRepository) {}

  async execute(): Promise<SubscriptionDto[]> {
    const entities = await this.subscriptions.findAll();
    return entities.map((subscription) => this.toDto(subscription));
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
