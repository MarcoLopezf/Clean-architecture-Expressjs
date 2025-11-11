import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from 'typeorm';
import { PromotionCodeEntity } from './PromotionCodeEntity';
import { SubscriptionEntity } from './SubscriptionEntity';
import { UserEntity } from './UserEntity';

export enum PromotionRedemptionStatus {
  PENDING = 'pending',
  APPLIED = 'applied',
  REVOKED = 'revoked',
  EXPIRED = 'expired'
}

@Entity({ name: 'promotion_redemptions' })
export class PromotionRedemptionEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => PromotionCodeEntity, (code) => code.redemptions, {
    nullable: false
  })
  @JoinColumn({ name: 'promotion_code_id' })
  promotionCode!: PromotionCodeEntity;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => SubscriptionEntity, { nullable: true })
  @JoinColumn({ name: 'subscription_id' })
  subscription?: SubscriptionEntity | null;

  @Column({ name: 'stripe_promotion_code_id', type: 'text' })
  stripePromotionCodeId!: string;

  @CreateDateColumn({ name: 'redeemed_at', type: 'timestamptz' })
  redeemedAt!: Date;

  @Column({
    type: 'enum',
    enum: PromotionRedemptionStatus,
    enumName: 'promotion_redemption_status',
    default: PromotionRedemptionStatus.PENDING
  })
  status!: PromotionRedemptionStatus;
}
