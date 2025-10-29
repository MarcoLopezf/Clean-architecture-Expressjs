export type SubscriptionStatusValue = 'active' | 'paused' | 'cancelled';

export class SubscriptionStatus {
  private constructor(private readonly value: SubscriptionStatusValue) {}

  static readonly ACTIVE = new SubscriptionStatus('active');
  static readonly PAUSED = new SubscriptionStatus('paused');
  static readonly CANCELLED = new SubscriptionStatus('cancelled');

  static create(value: SubscriptionStatusValue): SubscriptionStatus {
    return new SubscriptionStatus(value);
  }

  equals(other: SubscriptionStatus): boolean {
    return this.value === other.value;
  }

  toString(): SubscriptionStatusValue {
    return this.value;
  }
}
