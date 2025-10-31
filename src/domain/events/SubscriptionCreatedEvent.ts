import type { DomainEvent } from '../shared/DomainEvent';
import type { SubscriptionId } from '../shared/SubscriptionId';

interface SubscriptionCreatedEventProps {
  readonly subscriptionId: SubscriptionId;
  readonly userId: string;
  readonly planId: string;
  readonly occurredAt?: Date;
}

export class SubscriptionCreatedEvent implements DomainEvent {
  readonly eventName = 'subscription.created';
  readonly occurredAt: Date;
  readonly subscriptionId: SubscriptionId;
  readonly userId: string;
  readonly planId: string;

  private constructor(props: SubscriptionCreatedEventProps) {
    this.subscriptionId = props.subscriptionId;
    this.userId = props.userId;
    this.planId = props.planId;
    this.occurredAt = props.occurredAt ?? new Date();
  }

  static create(props: SubscriptionCreatedEventProps): SubscriptionCreatedEvent {
    return new SubscriptionCreatedEvent(props);
  }
}
