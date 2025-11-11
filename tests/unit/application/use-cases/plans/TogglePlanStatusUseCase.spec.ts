import { describe, expect, it, vi } from 'vitest';
import { TogglePlanStatusUseCase } from '../../../../../src/application/use-cases/plans/TogglePlanStatusUseCase';
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
    update: vi.fn().mockResolvedValue(undefined),
    findAll: vi.fn()
  };

  const useCase = new TogglePlanStatusUseCase(planRepo);

  return { useCase, planRepo };
};

describe('TogglePlanStatusUseCase', () => {
  it('deactivates a plan when requested', async () => {
    const { useCase, planRepo } = setup();

    const result = await useCase.execute({ planId: 'plan-1', isActive: false });

    expect(planRepo.update).toHaveBeenCalled();
    expect(result.isActive).toBe(false);
  });

  it('activates a plan when requested', async () => {
    const { useCase, planRepo } = setup();
    existingPlan.deactivate();

    const result = await useCase.execute({ planId: 'plan-1', isActive: true });

    expect(planRepo.update).toHaveBeenCalled();
    expect(result.isActive).toBe(true);
  });

  it('throws when plan not found', async () => {
    const { useCase, planRepo } = setup();
    (planRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ planId: 'missing', isActive: true })
    ).rejects.toThrow('Plan not found');
  });
});
