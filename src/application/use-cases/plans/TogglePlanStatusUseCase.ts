import { Plan } from '../../../domain/entities/plans/Plan';
import { PlanId } from '../../../domain/shared/PlanId';
import { PlanRepository } from '../../ports/plan.repository';
import { PlanDto, TogglePlanStatusRequestDto } from '../../dtos/plans';

export class TogglePlanStatusUseCase {
  constructor(private readonly plans: PlanRepository) {}

  async execute(request: TogglePlanStatusRequestDto): Promise<PlanDto> {
    const plan = await this.ensurePlanExists(request.planId);

    if (request.isActive) {
      plan.activate();
    } else {
      plan.deactivate();
    }

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
