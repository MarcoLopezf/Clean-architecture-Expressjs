import { describe, expect, it, vi } from 'vitest';
import { GetSubscriptionByIdUseCase } from '../../../../../src/application/use-cases/subscriptions/GetSubscriptionByIdUseCase';
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

const existingSubscription = Subscription.create({
  id: 'sub-1',
  userId: 'user-1',
  plan
});

const setup = () => {
  const repo: SubscriptionRepository = {
    findById: vi.fn().mockResolvedValue(existingSubscription),
    save: vi.fn(),
    update: vi.fn(),
    findAll: vi.fn()
  };

  const useCase = new GetSubscriptionByIdUseCase(repo);

  return { useCase, repo };
};

describe('GetSubscriptionByIdUseCase', () => {
  it('returns the subscription DTO', async () => {
    const { useCase, repo } = setup();

    const result = await useCase.execute('sub-1');

    expect(repo.findById).toHaveBeenCalled();
    expect(result.id).toBe('sub-1');
    expect(result.planId).toBe('plan-1');
  });

  it('throws when the subscription does not exist', async () => {
    const { useCase, repo } = setup();
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(useCase.execute('missing')).rejects.toThrow(
      'Subscription not found'
    );
  });
});
