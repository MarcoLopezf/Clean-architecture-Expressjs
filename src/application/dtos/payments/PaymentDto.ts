export interface PaymentDto {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  processedAt?: Date;
}
