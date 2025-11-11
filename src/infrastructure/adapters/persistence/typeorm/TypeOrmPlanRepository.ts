import type { DataSource, Repository } from 'typeorm';
import { PlanRepository } from '../../../../application/ports/plan.repository';
import { Plan } from '../../../../domain/entities/plans/Plan';
import type { PlanPrimitives } from '../../../../domain/entities/plans/Plan';
import type { PlanId } from '../../../../domain/shared/PlanId';
import { PlanEntity } from '../../../database/entities/PlanEntity';
import { PlanPriceEntity } from '../../../database/entities/PlanPriceEntity';
import type { BillingCycleUnit } from '../../../database/entities/PlanPriceEntity';

export class TypeOrmPlanRepository implements PlanRepository {
  private readonly planRepo: Repository<PlanEntity>;
  private readonly priceRepo: Repository<PlanPriceEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.planRepo = dataSource.getRepository(PlanEntity);
    this.priceRepo = dataSource.getRepository(PlanPriceEntity);
  }

  async findById(id: PlanId): Promise<Plan | null> {
    const plan = await this.planRepo.findOne({
      where: { id: id.toString() },
      relations: {
        defaultPrice: true
      }
    });

    if (!plan) {
      return null;
    }

    return this.toDomain(plan);
  }

  async findAll(): Promise<Plan[]> {
    const plans = await this.planRepo.find({
      relations: {
        defaultPrice: true
      }
    });

    return plans
      .map((plan) => this.toDomain(plan))
      .filter((plan): plan is Plan => plan != null);
  }

  async save(plan: Plan): Promise<void> {
    await this.persistPlan(plan.toPrimitives());
  }

  async update(plan: Plan): Promise<void> {
    await this.persistPlan(plan.toPrimitives());
  }

  private async persistPlan(plan: PlanPrimitives): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const planRepository = manager.getRepository(PlanEntity);
      const priceRepository = manager.getRepository(PlanPriceEntity);

      let planEntity =
        (await planRepository.findOne({
          where: { id: plan.id },
          relations: { defaultPrice: true }
        })) ?? planRepository.create({ id: plan.id });

      planEntity = planRepository.merge(planEntity, {
        name: plan.name,
        description: plan.description ?? undefined,
        isActive: plan.isActive,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt
      });

      planEntity = await planRepository.save(planEntity);

      const planRef = planRepository.create({ id: planEntity.id });

      let priceEntity =
        planEntity.defaultPrice ??
        (await priceRepository.findOne({ where: { id: plan.id } })) ??
        priceRepository.create({
          id: plan.id
        });

      priceEntity = priceRepository.merge(priceEntity, {
        plan: planRef,
        billingCycleInterval: plan.billingCycleInterval,
        billingCycleUnit: plan.billingCycleUnit as BillingCycleUnit,
        amount: plan.amount.toString(),
        currency: plan.currency,
        baseAmount: null,
        discountPercentage: null,
        isActive: plan.isActive
      });

      priceEntity = await priceRepository.save(priceEntity);

      if (!planEntity.defaultPrice || planEntity.defaultPrice.id !== priceEntity.id) {
        await planRepository.update(planEntity.id, {
          defaultPrice: priceRepository.create({ id: priceEntity.id })
        });
      }
    });
  }

  private toDomain(plan: PlanEntity): Plan | null {
    if (!plan.defaultPrice) {
      return null;
    }

    return Plan.fromPrimitives({
      id: plan.id,
      name: plan.name,
      description: plan.description ?? undefined,
      amount: Number(plan.defaultPrice.amount),
      currency: plan.defaultPrice.currency,
      billingCycleUnit: plan.defaultPrice.billingCycleUnit,
      billingCycleInterval: plan.defaultPrice.billingCycleInterval,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    });
  }
}
