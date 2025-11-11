import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';
import { PlanEntity } from './PlanEntity';
import { PlanPriceEntity } from './PlanPriceEntity';
import { UserEntity } from './UserEntity';

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

@Entity({ name: 'subscriptions' })
export class SubscriptionEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => PlanEntity, { nullable: false })
  @JoinColumn({ name: 'plan_id' })
  plan!: PlanEntity;

  @ManyToOne(() => PlanPriceEntity, { nullable: false })
  @JoinColumn({ name: 'plan_price_id' })
  planPrice!: PlanPriceEntity;

  @Column({ name: 'stripe_subscription_id', type: 'text', unique: true, nullable: true })
  stripeSubscriptionId?: string | null;

  @Column({ name: 'stripe_customer_id', type: 'text', nullable: true })
  stripeCustomerId?: string | null;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    enumName: 'subscription_status',
    default: SubscriptionStatus.PENDING
  })
  status!: SubscriptionStatus;

  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'timestamptz' })
  endDate!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: UserEntity;
}
