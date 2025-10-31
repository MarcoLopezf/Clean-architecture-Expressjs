import type { Plan } from '../../domain/entities/plans/Plan';
import type { PlanId } from '../../domain/shared/PlanId';

export interface PlanRepository {
  findById(id: PlanId): Promise<Plan | null>;
}
