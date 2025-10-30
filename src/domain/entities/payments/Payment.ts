import { Price } from '../../shared/Price';
import { SubscriptionId } from '../../shared/SubscriptionId';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

interface PaymentProps {
  readonly id: string;
  readonly subscriptionId: SubscriptionId;
  readonly price: Price;
  status: PaymentStatus;
  readonly createdAt: Date;
  processedAt?: Date;
}

export interface PaymentCreateProps {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  createdAt?: Date;
}

export class Payment {
  private constructor(private readonly props: PaymentProps) {}

  static create(props: PaymentCreateProps): Payment {
    const paymentProps: PaymentProps = {
      id: props.id,
      subscriptionId: SubscriptionId.create(props.subscriptionId),
      price: Price.create(props.amount, props.currency),
      status: 'pending',
      createdAt: props.createdAt ?? new Date()
    };

    return new Payment(paymentProps);
  }

  get id(): string {
    return this.props.id;
  }

  get subscriptionId(): string {
    return this.props.subscriptionId.toString();
  }

  get amount(): number {
    return this.props.price.amount;
  }

  get currency(): string {
    return this.props.price.currency;
  }

  get price(): Price {
    return this.props.price;
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

  toPrimitives(): PaymentPrimitives {
    return {
      id: this.props.id,
      subscriptionId: this.subscriptionId,
      amount: this.amount,
      currency: this.currency,
      status: this.props.status,
      createdAt: this.props.createdAt,
      processedAt: this.props.processedAt
    };
  }
}

export interface PaymentPrimitives {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: Date;
  processedAt?: Date;
}
