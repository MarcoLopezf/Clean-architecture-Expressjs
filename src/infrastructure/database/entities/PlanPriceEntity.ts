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
import { UserEntity } from './UserEntity';

export enum BillingCycleUnit {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year'
}

@Entity({ name: 'plan_prices' })
export class PlanPriceEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => PlanEntity, (plan) => plan.prices, { nullable: false })
  @JoinColumn({ name: 'plan_id' })
  plan!: PlanEntity;

  @Column({ name: 'stripe_price_id', type: 'text', unique: true, nullable: true })
  stripePriceId?: string | null;

  @Column({
    name: 'billing_cycle_interval',
    type: 'int',
    default: 1
  })
  billingCycleInterval!: number;

  @Column({
    name: 'billing_cycle_unit',
    type: 'enum',
    enum: BillingCycleUnit,
    enumName: 'billing_cycle_unit',
    default: BillingCycleUnit.MONTH
  })
  billingCycleUnit!: BillingCycleUnit;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'char', length: 3 })
  currency!: string;

  @Column({ name: 'base_amount', type: 'numeric', precision: 12, scale: 2, nullable: true })
  baseAmount?: string | null;

  @Column({
    name: 'discount_percentage',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true
  })
  discountPercentage?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: UserEntity;
}
