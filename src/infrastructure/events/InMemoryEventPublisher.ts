import { EventPublisher } from '../../application/ports/event.publisher';
import { DomainEvent } from '../../domain/shared/DomainEvent';

export class InMemoryEventPublisher implements EventPublisher {
  readonly published: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.published.push(event);
  }

  async publishBulk(events: DomainEvent[]): Promise<void> {
    this.published.push(...events);
  }
}
