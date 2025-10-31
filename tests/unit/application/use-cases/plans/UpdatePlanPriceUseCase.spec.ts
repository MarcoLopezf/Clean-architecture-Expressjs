import { describe, expect, it, vi } from 'vitest';
import { UpdatePlanPriceUseCase } from '../../../../../src/application/use-cases/plans/UpdatePlanPriceUseCase';
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
    update: vi.fn().mockResolvedValue(undefined)
  };

  const useCase = new UpdatePlanPriceUseCase(planRepo);

  return { useCase, planRepo };
};

describe('UpdatePlanPriceUseCase', () => {
  it('updates plan price', async () => {
    const { useCase, planRepo } = setup();

    const result = await useCase.execute({
      planId: 'plan-1',
      amount: 20,
      currency: 'EUR'
    });

    expect(planRepo.update).toHaveBeenCalled();
    expect(result.amount).toBe(20);
    expect(result.currency).toBe('EUR');
  });

  it('throws when plan not found', async () => {
    const { useCase, planRepo } = setup();
    (planRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ planId: 'missing', amount: 15, currency: 'USD' })
    ).rejects.toThrow('Plan not found');
  });
});
