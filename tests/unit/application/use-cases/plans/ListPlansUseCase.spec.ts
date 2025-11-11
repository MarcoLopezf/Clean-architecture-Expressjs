import { describe, expect, it, vi } from 'vitest';
import { ListPlansUseCase } from '../../../../../src/application/use-cases/plans/ListPlansUseCase';
import { PlanRepository } from '../../../../../src/application/ports/plan.repository';
import { Plan } from '../../../../../src/domain/entities/plans/Plan';

const planA = Plan.create({
  id: 'plan-a',
  name: 'Plan A',
  amount: 10,
  currency: 'USD',
  billingCycleUnit: 'month'
});

const planB = Plan.create({
  id: 'plan-b',
  name: 'Plan B',
  amount: 20,
  currency: 'USD',
  billingCycleUnit: 'month'
});

describe('ListPlansUseCase', () => {
  it('maps all plans to DTOs', async () => {
    const planRepo: PlanRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      findAll: vi.fn().mockResolvedValue([planA, planB])
    };

    const useCase = new ListPlansUseCase(planRepo);

    const result = await useCase.execute();

    expect(planRepo.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('plan-a');
    expect(result[1].amount).toBe(20);
  });
});
