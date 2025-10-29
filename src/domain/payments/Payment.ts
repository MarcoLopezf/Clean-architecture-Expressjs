export type PaymentStatus = 'pending' | 'completed' | 'failed';

interface PaymentProps {
  readonly id: string;
  readonly subscriptionId: string;
  readonly amount: number;
  readonly currency: string;
  status: PaymentStatus;
  readonly createdAt: Date;
  processedAt?: Date;
}

export interface CreatePaymentProps {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  createdAt?: Date;
}

export class Payment {
  private constructor(private readonly props: PaymentProps) {}

  static create(props: CreatePaymentProps): Payment {
    Payment.ensureValidAmount(props.amount);
    Payment.ensureCurrencyCode(props.currency);

    const paymentProps: PaymentProps = {
      id: props.id,
      subscriptionId: props.subscriptionId,
      amount: props.amount,
      currency: props.currency.toUpperCase(),
      status: 'pending',
      createdAt: props.createdAt ?? new Date()
    };

    return new Payment(paymentProps);
  }

  get id(): string {
    return this.props.id;
  }

  get subscriptionId(): string {
    return this.props.subscriptionId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get processedAt(): Date | undefined {
    return this.props.processedAt;
  }

  markAsCompleted(processedAt: Date = new Date()): void {
    if (this.props.status === 'completed') {
      return;
    }

    if (this.props.status === 'failed') {
      throw new Error('Cannot mark a failed payment as completed.');
    }

    this.props.status = 'completed';
    this.props.processedAt = processedAt;
  }

  markAsFailed(): void {
    if (this.props.status === 'completed') {
      throw new Error('Cannot mark a completed payment as failed.');
    }

    this.props.status = 'failed';
  }

  toPrimitives(): PaymentSnapshot {
    return {
      id: this.props.id,
      subscriptionId: this.props.subscriptionId,
      amount: this.props.amount,
      currency: this.props.currency,
      status: this.props.status,
      createdAt: this.props.createdAt,
      processedAt: this.props.processedAt
    };
  }

  private static ensureValidAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Payment amount must be a positive number.');
    }
  }

  private static ensureCurrencyCode(currency: string): void {
    if (!/^[A-Z]{3}$/i.test(currency)) {
      throw new Error('Currency must be a valid ISO 4217 code.');
    }
  }
}

export interface PaymentSnapshot {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: Date;
  processedAt?: Date;
}
