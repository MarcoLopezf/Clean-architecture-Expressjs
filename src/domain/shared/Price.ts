interface PriceProps {
  readonly amount: number;
  readonly currency: string;
}

export class Price {
  private constructor(private readonly props: PriceProps) {}

  static create(amount: number, currency: string): Price {
    Price.ensureValidAmount(amount);
    Price.ensureCurrencyCode(currency);

    return new Price({
      amount,
      currency: currency.toUpperCase()
    });
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  equals(other: Price): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toPrimitives(): PriceProps {
    return { ...this.props };
  }

  private static ensureValidAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Price amount must be a positive number.');
    }
  }

  private static ensureCurrencyCode(currency: string): void {
    if (!/^[A-Z]{3}$/i.test(currency)) {
      throw new Error('Price currency must be a valid ISO 4217 code.');
    }
  }
}
