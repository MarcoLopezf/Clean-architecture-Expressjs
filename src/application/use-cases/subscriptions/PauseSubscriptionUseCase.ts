import { Subscription } from '../../../domain/entities/subscriptions/Subscription';
import { SubscriptionId } from '../../../domain/shared/SubscriptionId';
import {
  PauseSubscriptionRequestDto,
  SubscriptionDto
} from '../../dtos/subscriptions';
import { SubscriptionRepository } from '../../ports/subscription.repository';

export class PauseSubscriptionUseCase {
  constructor(private readonly subscriptions: SubscriptionRepository) {}

  async execute(request: PauseSubscriptionRequestDto): Promise<SubscriptionDto> {
    const subscription = await this.ensureSubscriptionExists(request.subscriptionId);

    subscription.pause();
    await this.subscriptions.update(subscription);

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
