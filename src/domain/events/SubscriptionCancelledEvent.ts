import type { DomainEvent } from '../shared/DomainEvent';
import type { SubscriptionId } from '../shared/SubscriptionId';

interface SubscriptionCancelledEventProps {
  readonly subscriptionId: SubscriptionId;
  readonly effectiveDate: Date;
  readonly occurredAt?: Date;
}

export class SubscriptionCancelledEvent implements DomainEvent {
  readonly eventName = 'subscription.cancelled';
  readonly occurredAt: Date;
  readonly subscriptionId: SubscriptionId;
  readonly effectiveDate: Date;

  private constructor(props: SubscriptionCancelledEventProps) {
    this.subscriptionId = props.subscriptionId;
    this.effectiveDate = props.effectiveDate;
    this.occurredAt = props.occurredAt ?? new Date();
  }

  static create(props: SubscriptionCancelledEventProps): SubscriptionCancelledEvent {
    return new SubscriptionCancelledEvent(props);
  }
}
