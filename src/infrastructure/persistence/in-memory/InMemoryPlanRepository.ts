import { Plan } from '../../../domain/entities/plans/Plan';
import { PlanCreateProps, PlanPrimitives } from '../../../domain/entities/plans/Plan';
import { PlanRepository } from '../../../application/ports/plan.repository';
import { PlanId } from '../../../domain/shared/PlanId';

export class InMemoryPlanRepository implements PlanRepository {
  private readonly storage = new Map<string, PlanPrimitives>();

  constructor(initialPlans: PlanPrimitives[] = []) {
    initialPlans.forEach((plan) => {
      this.storage.set(plan.id, plan);
    });
  }

  async findById(id: PlanId): Promise<Plan | null> {
    const plan = this.storage.get(id.toString());
    return plan ? Plan.fromPrimitives(plan) : null;
  }

  async save(plan: Plan): Promise<void> {
    this.storage.set(plan.id, plan.toPrimitives());
  }

  async update(plan: Plan): Promise<void> {
    await this.save(plan);
  }

  seed(planProps: PlanCreateProps): Plan {
    const plan = Plan.create(planProps);
    this.storage.set(plan.id, plan.toPrimitives());
    return plan;
  }
}
