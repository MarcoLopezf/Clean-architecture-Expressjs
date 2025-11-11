import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity({ name: 'payment_methods' })
export class PaymentMethodEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'stripe_payment_method_id', type: 'text' })
  stripePaymentMethodId!: string;

  @Column({ type: 'text', nullable: true })
  brand?: string | null;

  @Column({ type: 'char', length: 4, nullable: true })
  last4?: string | null;

  @Column({ name: 'exp_month', type: 'smallint', nullable: true })
  expMonth?: number | null;

  @Column({ name: 'exp_year', type: 'smallint', nullable: true })
  expYear?: number | null;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: UserEntity;
}
