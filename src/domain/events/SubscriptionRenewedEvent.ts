import type { DomainEvent } from '../shared/DomainEvent';
import type { SubscriptionId } from '../shared/SubscriptionId';

interface SubscriptionRenewedEventProps {
  readonly subscriptionId: SubscriptionId;
  readonly occurredAt: Date;
}

export class SubscriptionRenewedEvent implements DomainEvent {
  readonly eventName = 'subscription.renewed';
  readonly occurredAt: Date;
  readonly subscriptionId: SubscriptionId;

  private constructor(props: SubscriptionRenewedEventProps) {
    this.subscriptionId = props.subscriptionId;
    this.occurredAt = props.occurredAt;
  }

  static create(subscriptionId: SubscriptionId): SubscriptionRenewedEvent {
    return new SubscriptionRenewedEvent({
      subscriptionId,
      occurredAt: new Date()
    });
  }
}
