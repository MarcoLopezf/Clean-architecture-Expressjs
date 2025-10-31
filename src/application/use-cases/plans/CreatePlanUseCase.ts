import { Plan } from '../../../domain/entities/plans/Plan';
import { PlanRepository } from '../../ports/plan.repository';
import {
  CreatePlanRequestDto,
  CreatePlanResponseDto
} from '../../dtos/plans';
import { IdGenerator } from '../../ports/id-generator';

export class CreatePlanUseCase {
  constructor(
    private readonly plans: PlanRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(request: CreatePlanRequestDto): Promise<CreatePlanResponseDto> {
    const plan = Plan.create({
      id: this.idGenerator.generate(),
      name: request.name,
      description: request.description,
      amount: request.amount,
      currency: request.currency,
      billingCycleUnit: request.billingCycleUnit,
      billingCycleInterval: request.billingCycleInterval
    });

    await this.plans.save(plan);

    return { planId: plan.id };
  }
}
