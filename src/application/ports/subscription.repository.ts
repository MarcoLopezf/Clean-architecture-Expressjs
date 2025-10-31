import type { Subscription } from '../../domain/entities/subscriptions/Subscription';
import type { SubscriptionId } from '../../domain/shared/SubscriptionId';

export interface SubscriptionRepository {
  findById(id: SubscriptionId): Promise<Subscription | null>;
  save(subscription: Subscription): Promise<void>;
  update(subscription: Subscription): Promise<void>;
}
