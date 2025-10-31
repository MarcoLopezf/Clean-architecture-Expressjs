import type { PaymentCreateProps } from '../../domain/entities/payments/Payment';

export interface PaymentGateway {
  charge(props: PaymentCreateProps): Promise<void>;
}
