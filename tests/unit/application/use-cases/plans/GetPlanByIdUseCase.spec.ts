import { describe, expect, it, vi } from 'vitest';
import { GetPlanByIdUseCase } from '../../../../../src/application/use-cases/plans/GetPlanByIdUseCase';
import { PlanRepository } from '../../../../../src/application/ports/plan.repository';
import { Plan } from '../../../../../src/domain/entities/plans/Plan';

const existingPlan = Plan.create({
  id: 'plan-1',
  name: 'Basic',
  amount: 10,
  currency: 'USD',
  billingCycleUnit: 'month'
});

const setup = () => {
  const planRepo: PlanRepository = {
    findById: vi.fn().mockResolvedValue(existingPlan),
    save: vi.fn(),
    update: vi.fn(),
    findAll: vi.fn()
  };

  const useCase = new GetPlanByIdUseCase(planRepo);

  return { useCase, planRepo };
};

describe('GetPlanByIdUseCase', () => {
  it('returns the plan DTO when found', async () => {
    const { useCase, planRepo } = setup();

    const result = await useCase.execute('plan-1');

    expect(planRepo.findById).toHaveBeenCalled();
    expect(result.id).toBe('plan-1');
    expect(result.amount).toBe(10);
  });

  it('throws when the plan does not exist', async () => {
    const { useCase, planRepo } = setup();
    (planRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(useCase.execute('missing')).rejects.toThrow('Plan not found');
  });
});
