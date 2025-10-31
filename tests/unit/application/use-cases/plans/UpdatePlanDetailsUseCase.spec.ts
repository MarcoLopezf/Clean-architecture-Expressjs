import { describe, expect, it, vi } from 'vitest';
import { UpdatePlanDetailsUseCase } from '../../../../../src/application/use-cases/plans/UpdatePlanDetailsUseCase';
import { PlanRepository } from '../../../../../src/application/ports/plan.repository';
import { Plan } from '../../../../../src/domain/entities/plans/Plan';

const existingPlan = Plan.create({
  id: 'plan-1',
  name: 'Basic',
  description: 'Old desc',
  amount: 10,
  currency: 'USD',
  billingCycleUnit: 'month'
});

const setup = () => {
  const planRepo: PlanRepository = {
    findById: vi.fn().mockResolvedValue(existingPlan),
    save: vi.fn(),
    update: vi.fn().mockResolvedValue(undefined)
  };

  const useCase = new UpdatePlanDetailsUseCase(planRepo);

  return { useCase, planRepo };
};

describe('UpdatePlanDetailsUseCase', () => {
  it('updates name and description', async () => {
    const { useCase, planRepo } = setup();

    const result = await useCase.execute({
      planId: 'plan-1',
      name: 'Pro',
      description: 'New desc'
    });

    expect(planRepo.update).toHaveBeenCalled();
    expect(result.name).toBe('Pro');
    expect(result.description).toBe('New desc');
  });

  it('throws when plan not found', async () => {
    const { useCase, planRepo } = setup();
    (planRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ planId: 'missing', name: 'New' })
    ).rejects.toThrow('Plan not found');
  });
});
