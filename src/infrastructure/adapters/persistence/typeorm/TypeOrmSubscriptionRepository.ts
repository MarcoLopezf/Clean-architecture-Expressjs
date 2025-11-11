import type { DataSource, Repository } from 'typeorm';
import { SubscriptionRepository } from '../../../../application/ports/subscription.repository';
import { Subscription } from '../../../../domain/entities/subscriptions/Subscription';
import type { SubscriptionPrimitives } from '../../../../domain/entities/subscriptions/Subscription';
import type { SubscriptionId } from '../../../../domain/shared/SubscriptionId';
import { Plan } from '../../../../domain/entities/plans/Plan';
import { PlanEntity } from '../../../database/entities/PlanEntity';
import { PlanPriceEntity } from '../../../database/entities/PlanPriceEntity';
import { SubscriptionEntity } from '../../../database/entities/SubscriptionEntity';
import { SubscriptionStatus } from '../../../database/entities/SubscriptionEntity';
import { UserEntity } from '../../../database/entities/UserEntity';
import { SubscriptionStatusValue } from '../../../../domain/shared/SubscriptionStatus';

export class TypeOrmSubscriptionRepository implements SubscriptionRepository {
  private readonly subscriptionRepo: Repository<SubscriptionEntity>;
  private readonly planRepo: Repository<PlanEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.subscriptionRepo = dataSource.getRepository(SubscriptionEntity);
    this.planRepo = dataSource.getRepository(PlanEntity);
  }

  async findById(id: SubscriptionId): Promise<Subscription | null> {
    const entity = await this.subscriptionRepo.findOne({
      where: { id: id.toString() },
      relations: {
        user: true,
        plan: {
          defaultPrice: true
        },
        planPrice: true
      }
    });

    if (!entity || !entity.planPrice) {
      return null;
    }

    return this.toDomain(entity);
  }

  async findAll(): Promise<Subscription[]> {
    const entities = await this.subscriptionRepo.find({
      relations: {
        user: true,
        plan: {
          defaultPrice: true
        },
        planPrice: true
      }
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async save(subscription: Subscription): Promise<void> {
    await this.persist(subscription.toPrimitives());
  }

  async update(subscription: Subscription): Promise<void> {
    await this.persist(subscription.toPrimitives());
  }

  private async persist(subscription: SubscriptionPrimitives): Promise<void> {
    const planEntity = await this.planRepo.findOne({
      where: { id: subscription.plan.id },
      relations: { defaultPrice: true }
    });

    if (!planEntity || !planEntity.defaultPrice) {
      throw new Error(
        `Plan ${subscription.plan.id} is not persisted with a default price. Persist the plan before the subscription.`
      );
    }

    const userReference = this.buildUserReference(subscription.userId);

    const entity = this.subscriptionRepo.create({
      id: subscription.id,
      user: userReference,
      plan: planEntity,
      planPrice: planEntity.defaultPrice,
      status: this.toEntityStatus(subscription.status),
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      createdAt: subscription.startDate,
      updatedAt: subscription.endDate
    });

    await this.subscriptionRepo.save(entity);
  }

  private toDomain(entity: SubscriptionEntity): Subscription {
    const planPrice = entity.planPrice ?? entity.plan.defaultPrice;
    if (!planPrice) {
      throw new Error(`Subscription ${entity.id} is missing a plan price relationship.`);
    }

    const planPrimitives = this.planPriceToPrimitives(entity.plan, planPrice);

    return Subscription.fromPrimitives({
      id: entity.id,
      userId: entity.user.id,
      plan: planPrimitives,
      status: this.toDomainStatus(entity.status),
      startDate: entity.startDate,
      endDate: entity.endDate
    });
  }

  private planPriceToPrimitives(
    plan: PlanEntity,
    price: PlanPriceEntity
  ): ReturnType<Plan['toPrimitives']> {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description ?? undefined,
      amount: Number(price.amount),
      currency: price.currency,
      billingCycleUnit: price.billingCycleUnit,
      billingCycleInterval: price.billingCycleInterval,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    };
  }

  private buildUserReference(userId: string): UserEntity {
    return this.dataSource.getRepository(UserEntity).create({ id: userId });
  }

  private toEntityStatus(status: SubscriptionStatusValue): SubscriptionStatus {
    const key = status.toUpperCase() as keyof typeof SubscriptionStatus;
    return SubscriptionStatus[key];
  }

  private toDomainStatus(status: SubscriptionStatus): SubscriptionStatusValue {
    return status.toLowerCase() as SubscriptionStatusValue;
  }
}
