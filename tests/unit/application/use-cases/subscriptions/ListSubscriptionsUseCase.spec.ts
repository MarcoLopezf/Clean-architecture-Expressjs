import { describe, expect, it, vi } from 'vitest';
import { ListSubscriptionsUseCase } from '../../../../../src/application/use-cases/subscriptions/ListSubscriptionsUseCase';
import { SubscriptionRepository } from '../../../../../src/application/ports/subscription.repository';
import { Subscription } from '../../../../../src/domain/entities/subscriptions/Subscription';
import { Plan } from '../../../../../src/domain/entities/plans/Plan';

const plan = Plan.create({
  id: 'plan-1',
  name: 'Basic',
  amount: 10,
  currency: 'USD',
  billingCycleUnit: 'month'
});

const subscriptions = [
  Subscription.create({ id: 'sub-1', userId: 'user-1', plan }),
  Subscription.create({ id: 'sub-2', userId: 'user-2', plan })
];

describe('ListSubscriptionsUseCase', () => {
  it('returns every subscription DTO', async () => {
    const repo: SubscriptionRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      findAll: vi.fn().mockResolvedValue(subscriptions)
    };

    const useCase = new ListSubscriptionsUseCase(repo);

    const result = await useCase.execute();

    expect(repo.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[0].userId).toBe('user-1');
  });
});
