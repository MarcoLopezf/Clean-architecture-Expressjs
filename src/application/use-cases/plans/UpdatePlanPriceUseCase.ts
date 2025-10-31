import { Plan } from '../../../domain/entities/plans/Plan';
import { PlanId } from '../../../domain/shared/PlanId';
import { PlanRepository } from '../../ports/plan.repository';
import { PlanDto, UpdatePlanPriceRequestDto } from '../../dtos/plans';

export class UpdatePlanPriceUseCase {
  constructor(private readonly plans: PlanRepository) {}

  async execute(request: UpdatePlanPriceRequestDto): Promise<PlanDto> {
    const plan = await this.ensurePlanExists(request.planId);

    plan.updatePrice(request.amount, request.currency);
    await this.plans.update(plan);

    return this.toDto(plan);
  }

  private async ensurePlanExists(planId: string): Promise<Plan> {
    const plan = await this.plans.findById(PlanId.create(planId));
    if (!plan) {
      throw new Error('Plan not found');
    }
    return plan;
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
