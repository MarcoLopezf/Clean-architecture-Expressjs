export class SubscriptionId {
  private constructor(private readonly value: string) {}

  static create(value: string): SubscriptionId {
    SubscriptionId.ensureValid(value);
    return new SubscriptionId(value);
  }

  equals(other: SubscriptionId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private static ensureValid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('SubscriptionId cannot be empty.');
    }
  }
}
