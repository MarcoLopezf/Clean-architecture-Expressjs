import { PlanRepository } from '../../ports/plan.repository';
import type { Plan } from '../../../domain/entities/plans/Plan';
import type { PlanDto } from '../../dtos/plans';

export class ListPlansUseCase {
  constructor(private readonly plans: PlanRepository) {}

  async execute(): Promise<PlanDto[]> {
    const planEntities = await this.plans.findAll();
    return planEntities.map((plan) => this.toDto(plan));
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
