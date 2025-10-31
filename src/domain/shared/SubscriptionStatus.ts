export enum SubscriptionStatusValue {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

export class SubscriptionStatus {
  private constructor(private readonly value: SubscriptionStatusValue) {}

  static readonly PENDING = new SubscriptionStatus(SubscriptionStatusValue.PENDING);
  static readonly ACTIVE = new SubscriptionStatus(SubscriptionStatusValue.ACTIVE);
  static readonly PAUSED = new SubscriptionStatus(SubscriptionStatusValue.PAUSED);
  static readonly CANCELLED = new SubscriptionStatus(
    SubscriptionStatusValue.CANCELLED
  );

  static create(value: SubscriptionStatusValue): SubscriptionStatus {
    SubscriptionStatus.ensureValid(value);
    return new SubscriptionStatus(value);
  }

  equals(other: SubscriptionStatus): boolean {
    return this.value === other.value;
  }

  toString(): SubscriptionStatusValue {
    return this.value;
  }

  private static ensureValid(value: SubscriptionStatusValue): void {
    if (!Object.values(SubscriptionStatusValue).includes(value)) {
      throw new Error(`Invalid subscription status: ${value as string}`);
    }
  }
}
