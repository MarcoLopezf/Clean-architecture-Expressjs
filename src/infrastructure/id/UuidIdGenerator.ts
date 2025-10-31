import { randomUUID } from 'crypto';
import { IdGenerator } from '../../application/ports/id-generator';

export class UuidIdGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
}
