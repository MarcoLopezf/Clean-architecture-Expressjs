import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';
import { SubscriptionEntity } from './SubscriptionEntity';
import { UserEntity } from './UserEntity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

@Entity({ name: 'payments' })
export class PaymentEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => SubscriptionEntity, { nullable: false })
  @JoinColumn({ name: 'subscription_id' })
  subscription!: SubscriptionEntity;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'char', length: 3 })
  currency!: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    enumName: 'payment_status',
    default: PaymentStatus.PENDING
  })
  status!: PaymentStatus;

  @Column({ name: 'stripe_payment_intent_id', type: 'text', nullable: true })
  stripePaymentIntentId?: string | null;

  @Column({ name: 'stripe_invoice_id', type: 'text', nullable: true })
  stripeInvoiceId?: string | null;

  @Column({ name: 'stripe_charge_id', type: 'text', nullable: true })
  stripeChargeId?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt?: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: UserEntity;
}
