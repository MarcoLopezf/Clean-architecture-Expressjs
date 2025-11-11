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
import { PlanPriceEntity } from './PlanPriceEntity';
import { UserEntity } from './UserEntity';

@Entity({ name: 'plans' })
export class PlanEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'stripe_product_id', type: 'text', unique: true, nullable: true })
  stripeProductId?: string | null;

  @ManyToOne(() => PlanPriceEntity, { nullable: true })
  @JoinColumn({ name: 'default_price_id' })
  defaultPrice?: PlanPriceEntity | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: UserEntity;

  @OneToMany(() => PlanPriceEntity, (price) => price.plan)
  prices?: PlanPriceEntity[];
}
