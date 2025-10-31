import { describe, expect, it, vi } from 'vitest';
import { PauseSubscriptionUseCase } from '../../../../../src/application/use-cases/subscriptions/PauseSubscriptionUseCase';
import { SubscriptionRepository } from '../../../../../src/application/ports/subscription.repository';
import { Subscription } from '../../../../../src/domain/entities/subscriptions/Subscription';
import { Plan } from '../../../../../src/domain/entities/plans/Plan';
import { SubscriptionStatusValue } from '../../../../../src/domain/shared/SubscriptionStatus';

const plan = Plan.create({
  id: 'plan-1',
  name: 'Basic',
  amount: 10,
  currency: 'USD',
  billingCycleUnit: 'month'
});

const activeSubscription = (() => {
  const subscription = Subscription.create({
    id: 'sub-1',
    userId: 'user-1',
    plan
  });
  subscription.activate();
  return subscription;
})();

const setup = () => {
  const subscriptionRepo: SubscriptionRepository = {
    findById: vi.fn().mockResolvedValue(activeSubscription),
    save: vi.fn(),
    update: vi.fn().mockResolvedValue(undefined)
  };

  const useCase = new PauseSubscriptionUseCase(subscriptionRepo);

  return { useCase, subscriptionRepo };
};

describe('PauseSubscriptionUseCase', () => {
  it('pauses an active subscription', async () => {
    const { useCase, subscriptionRepo } = setup();

    const response = await useCase.execute({ subscriptionId: 'sub-1' });

    expect(subscriptionRepo.update).toHaveBeenCalledWith(expect.any(Subscription));
    expect(response.status).toBe(SubscriptionStatusValue.PAUSED);
  });

  it('throws when subscription not found', async () => {
    const { useCase, subscriptionRepo } = setup();
    (subscriptionRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ subscriptionId: 'missing-subscription' })
    ).rejects.toThrow('Subscription not found');
  });
});
