import { PaymentGateway } from '../../application/ports/payment.gateway';
import { PaymentCreateProps } from '../../domain/entities/payments/Payment';

export class InMemoryPaymentGateway implements PaymentGateway {
  constructor(private readonly shouldFail = false) {}

  async charge(props: PaymentCreateProps): Promise<void> {
    if (this.shouldFail) {
      throw new Error('Payment failed');
    }
  }
}
