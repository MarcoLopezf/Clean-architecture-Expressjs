import { PlanRepository } from '../../ports/plan.repository';
import { PlanId } from '../../../domain/shared/PlanId';
import type { Plan } from '../../../domain/entities/plans/Plan';
import type { PlanDto } from '../../dtos/plans';

export class GetPlanByIdUseCase {
  constructor(private readonly plans: PlanRepository) {}

  async execute(planId: string): Promise<PlanDto> {
    const plan = await this.plans.findById(PlanId.create(planId));
    if (!plan) {
      throw new Error('Plan not found');
    }

    return this.toDto(plan);
  }

  private toDto(plan: Plan): PlanDto {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      amount: plan.amount,
      currency: plan.currency,
      billingCycleUnit: plan.billingCycle.unit,
      billingCycleInterval: plan.billingCycle.interval,
      isActive: plan.isActive
    };
  }
}
