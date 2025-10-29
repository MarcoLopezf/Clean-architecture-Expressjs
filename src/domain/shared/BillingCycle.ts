export type BillingCycleUnit = 'day' | 'week' | 'month' | 'year';

interface BillingCycleProps {
  readonly unit: BillingCycleUnit;
  readonly interval: number;
}

export class BillingCycle {
  private constructor(private readonly props: BillingCycleProps) {}

  static create(unit: BillingCycleUnit, interval = 1): BillingCycle {
    BillingCycle.ensurePositiveInterval(interval);

    return new BillingCycle({
      unit,
      interval
    });
  }

  get unit(): BillingCycleUnit {
    return this.props.unit;
  }

  get interval(): number {
    return this.props.interval;
  }

  toPrimitives(): BillingCycleProps {
    return { ...this.props };
  }

  equals(other: BillingCycle): boolean {
    return this.unit === other.unit && this.interval === other.interval;
  }

  private static ensurePositiveInterval(interval: number): void {
    if (!Number.isInteger(interval) || interval <= 0) {
      throw new Error('Billing cycle interval must be a positive integer.');
    }
  }
}
