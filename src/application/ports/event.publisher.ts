import type { DomainEvent } from '../../domain/shared/DomainEvent';

export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishBulk(events: DomainEvent[]): Promise<void>;
}
