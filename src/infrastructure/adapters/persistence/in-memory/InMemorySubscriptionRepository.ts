import { Subscription } from '../../../../domain/entities/subscriptions/Subscription';
import { SubscriptionPrimitives } from '../../../../domain/entities/subscriptions/Subscription';
import { SubscriptionRepository } from '../../../../application/ports/subscription.repository';
import { SubscriptionId } from '../../../../domain/shared/SubscriptionId';

export class InMemorySubscriptionRepository implements SubscriptionRepository {
  private readonly storage = new Map<string, SubscriptionPrimitives>();

  constructor(initialSubscriptions: SubscriptionPrimitives[] = []) {
    initialSubscriptions.forEach((subscription) => {
      this.storage.set(subscription.id, subscription);
    });
  }

  async findById(id: SubscriptionId): Promise<Subscription | null> {
    const subscription = this.storage.get(id.toString());
    return subscription ? Subscription.fromPrimitives(subscription) : null;
  }

  async save(subscription: Subscription): Promise<void> {
    this.storage.set(subscription.id, subscription.toPrimitives());
  }

  async update(subscription: Subscription): Promise<void> {
    await this.save(subscription);
  }

  seed(subscription: Subscription): void {
    this.storage.set(subscription.id, subscription.toPrimitives());
  }
}
