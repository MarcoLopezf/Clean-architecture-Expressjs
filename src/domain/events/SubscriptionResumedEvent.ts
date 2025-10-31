import type { DomainEvent } from '../shared/DomainEvent';
import type { SubscriptionId } from '../shared/SubscriptionId';

interface SubscriptionResumedEventProps {
  readonly subscriptionId: SubscriptionId;
  readonly occurredAt?: Date;
}

export class SubscriptionResumedEvent implements DomainEvent {
  readonly eventName = 'subscription.resumed';
  readonly occurredAt: Date;
  readonly subscriptionId: SubscriptionId;

  private constructor(props: SubscriptionResumedEventProps) {
    this.subscriptionId = props.subscriptionId;
    this.occurredAt = props.occurredAt ?? new Date();
  }

  static create(props: SubscriptionResumedEventProps): SubscriptionResumedEvent {
    return new SubscriptionResumedEvent(props);
  }
}
