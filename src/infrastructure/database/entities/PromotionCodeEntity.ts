import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';
import { PlanEntity } from './PlanEntity';
import { PlanPriceEntity } from './PlanPriceEntity';
import { UserEntity } from './UserEntity';
import { PromotionRedemptionEntity } from './PromotionRedemptionEntity';

@Entity({ name: 'promotion_codes' })
export class PromotionCodeEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'text', unique: true })
  code!: string;

  @Column({ name: 'stripe_promotion_code_id', type: 'text', unique: true })
  stripePromotionCodeId!: string;

  @Column({ name: 'stripe_coupon_id', type: 'text' })
  stripeCouponId!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @ManyToOne(() => PlanEntity, { nullable: true })
  @JoinColumn({ name: 'applies_to_plan_id' })
  appliesToPlan?: PlanEntity | null;

  @ManyToOne(() => PlanPriceEntity, { nullable: true })
  @JoinColumn({ name: 'applies_to_price_id' })
  appliesToPrice?: PlanPriceEntity | null;

  @Column({ name: 'max_redemptions', type: 'int', nullable: true })
  maxRedemptions?: number | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: UserEntity;

  @OneToMany(() => PromotionRedemptionEntity, (redemption) => redemption.promotionCode)
  redemptions?: PromotionRedemptionEntity[];
}
