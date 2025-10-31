import { IdGenerator } from '../../src/application/ports/id-generator';

export class StubIdGenerator implements IdGenerator {
  private index = 0;

  constructor(private readonly ids: string[]) {}

  generate(): string {
    const id = this.ids[this.index] ?? this.ids[this.ids.length - 1];
    this.index = Math.min(this.index + 1, this.ids.length - 1);
    return id;
  }
}
