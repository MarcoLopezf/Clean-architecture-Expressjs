import { describe, expect, it, vi } from 'vitest';
import { RenewSubscriptionUseCase } from '../../../../../src/application/use-cases/subscriptions/RenewSubscriptionUseCase';
import { SubscriptionRepository } from '../../../../../src/application/ports/subscription.repository';
import { PaymentGateway } from '../../../../../src/application/ports/payment.gateway';
import { EventPublisher } from '../../../../../src/application/ports/event.publisher';
import { IdGenerator } from '../../../../../src/application/ports/id-generator';
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

const subscription = (() => {
  const sub = Subscription.create({
    id: 'sub-1',
    userId: 'user-1',
    plan
  });
  sub.activate();
  return sub;
})();

const setup = () => {
  const subscriptionRepo: SubscriptionRepository = {
    findById: vi.fn().mockResolvedValue(subscription),
    save: vi.fn(),
    update: vi.fn().mockResolvedValue(undefined),
    findAll: vi.fn()
  };

  const paymentGateway: PaymentGateway = {
    charge: vi.fn().mockResolvedValue(undefined)
  };

  const eventPublisher: EventPublisher = {
    publish: vi.fn().mockResolvedValue(undefined),
    publishBulk: vi.fn().mockResolvedValue(undefined)
  };

  const idGenerator: IdGenerator = {
    generate: vi.fn().mockReturnValue('payment-1')
  };

  const useCase = new RenewSubscriptionUseCase(
    subscriptionRepo,
    paymentGateway,
    eventPublisher,
    idGenerator
  );

  return { useCase, subscriptionRepo, paymentGateway, eventPublisher };
};

describe('RenewSubscriptionUseCase', () => {
  it('charges, renews and publishes event', async () => {
    const { useCase, subscriptionRepo, paymentGateway, eventPublisher } = setup();

    const response = await useCase.execute({ subscriptionId: 'sub-1' });

    expect(paymentGateway.charge).toHaveBeenCalledWith(
      expect.objectContaining({
        subscriptionId: 'sub-1',
        amount: 10,
        currency: 'USD'
      })
    );
    expect(subscriptionRepo.update).toHaveBeenCalledWith(expect.any(Subscription));
    expect(eventPublisher.publish).toHaveBeenCalled();
    expect(response.status).toBe(SubscriptionStatusValue.ACTIVE);
  });

  it('throws if subscription not found', async () => {
    const { useCase, subscriptionRepo } = setup();
    (subscriptionRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ subscriptionId: 'missing-subscription' })
    ).rejects.toThrow('Subscription not found');
  });

  it('throws if subscription is not active', async () => {
    const { useCase, subscriptionRepo } = setup();
    const pending = Subscription.create({
      id: 'pending-sub',
      userId: 'user-1',
      plan
    });
    (subscriptionRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(pending);

    await expect(
      useCase.execute({ subscriptionId: 'pending-sub' })
    ).rejects.toThrow('Only active subscriptions can be renewed.');
  });
});
