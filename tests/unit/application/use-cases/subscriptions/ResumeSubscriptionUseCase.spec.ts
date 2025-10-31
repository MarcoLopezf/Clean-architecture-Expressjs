import { describe, expect, it, vi } from 'vitest';
import { ResumeSubscriptionUseCase } from '../../../../../src/application/use-cases/subscriptions/ResumeSubscriptionUseCase';
import { SubscriptionRepository } from '../../../../../src/application/ports/subscription.repository';
import { EventPublisher } from '../../../../../src/application/ports/event.publisher';
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

const pausedSubscription = (() => {
  const subscription = Subscription.create({
    id: 'sub-1',
    userId: 'user-1',
    plan
  });
  subscription.activate();
  subscription.pause();
  return subscription;
})();

const setup = () => {
  const subscriptionRepo: SubscriptionRepository = {
    findById: vi.fn().mockResolvedValue(pausedSubscription),
    save: vi.fn(),
    update: vi.fn().mockResolvedValue(undefined)
  };

  const eventPublisher: EventPublisher = {
    publish: vi.fn().mockResolvedValue(undefined),
    publishBulk: vi.fn().mockResolvedValue(undefined)
  };

  const useCase = new ResumeSubscriptionUseCase(subscriptionRepo, eventPublisher);

  return { useCase, subscriptionRepo, eventPublisher };
};

describe('ResumeSubscriptionUseCase', () => {
  it('resumes a paused subscription and publishes event', async () => {
    const { useCase, subscriptionRepo, eventPublisher } = setup();

    const response = await useCase.execute({ subscriptionId: 'sub-1' });

    expect(subscriptionRepo.update).toHaveBeenCalledWith(expect.any(Subscription));
    expect(eventPublisher.publish).toHaveBeenCalled();
    expect(response.status).toBe(SubscriptionStatusValue.ACTIVE);
  });

  it('throws when subscription not found', async () => {
    const { useCase, subscriptionRepo } = setup();
    (subscriptionRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ subscriptionId: 'missing-subscription' })
    ).rejects.toThrow('Subscription not found');
  });
});
