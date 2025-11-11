import { describe, expect, it, vi } from 'vitest';
import { CreatePlanUseCase } from '../../../../../src/application/use-cases/plans/CreatePlanUseCase';
import { PlanRepository } from '../../../../../src/application/ports/plan.repository';
import { IdGenerator } from '../../../../../src/application/ports/id-generator';

const setup = () => {
  const planRepo: PlanRepository = {
    findById: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    update: vi.fn(),
    findAll: vi.fn()
  };

  const idGenerator: IdGenerator = {
    generate: vi.fn().mockReturnValue('plan-1')
  };

  const useCase = new CreatePlanUseCase(planRepo, idGenerator);

  return { useCase, planRepo };
};

describe('CreatePlanUseCase', () => {
  it('creates a plan and persists it', async () => {
    const { useCase, planRepo } = setup();

    const response = await useCase.execute({
      name: 'Basic',
      description: 'Desc',
      amount: 10,
      currency: 'USD',
      billingCycleUnit: 'month'
    });

    expect(planRepo.save).toHaveBeenCalled();
    expect(response.planId).toBe('plan-1');
  });
});
