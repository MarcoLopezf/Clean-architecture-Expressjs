import { describe, expect, it, vi } from 'vitest';
import { CreateSubscriptionUseCase } from '../../../../../src/application/use-cases/subscriptions/CreateSubscriptionUseCase';
import { SubscriptionRepository } from '../../../../../src/application/ports/subscription.repository';
import { PlanRepository } from '../../../../../src/application/ports/plan.repository';
import { UserRepository } from '../../../../../src/application/ports/user.repository';
import { PaymentGateway } from '../../../../../src/application/ports/payment.gateway';
import { EventPublisher } from '../../../../../src/application/ports/event.publisher';
import { IdGenerator } from '../../../../../src/application/ports/id-generator';
import { Plan } from '../../../../../src/domain/entities/plans/Plan';
import { User } from '../../../../../src/domain/entities/users/User';
import { Subscription } from '../../../../../src/domain/entities/subscriptions/Subscription';

describe('CreateSubscriptionUseCase', () => {
  const plan = Plan.create({
    id: 'plan-1',
    name: 'Basic',
    amount: 10,
    currency: 'USD',
    billingCycleUnit: 'month'
  });

  const user = User.create({
    id: 'user-1',
    email: 'user@example.com',
    name: 'User Example'
  });

  const idSequence = ['sub-1', 'payment-1'];

  const setup = () => {
    const subscriptionRepo: SubscriptionRepository = {
      findById: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined)
    };

    const planRepo: PlanRepository = {
      findById: vi.fn().mockResolvedValue(plan),
      save: vi.fn(),
      update: vi.fn()
    };

    const userRepo: UserRepository = {
      findById: vi.fn().mockResolvedValue(user),
      findByEmail: vi.fn(),
      save: vi.fn(),
      update: vi.fn()
    };

    const paymentGateway: PaymentGateway = {
      charge: vi.fn().mockResolvedValue(undefined)
    };

    const eventPublisher: EventPublisher = {
      publish: vi.fn().mockResolvedValue(undefined),
      publishBulk: vi.fn().mockResolvedValue(undefined)
    };

    const idGenerator: IdGenerator = {
      generate: vi.fn().mockImplementation(() => idSequence.shift() ?? 'default-id')
    };

    const useCase = new CreateSubscriptionUseCase(
      subscriptionRepo,
      planRepo,
      userRepo,
      paymentGateway,
      eventPublisher,
      idGenerator
    );

    return {
      useCase,
      subscriptionRepo,
      planRepo,
      userRepo,
      paymentGateway,
      eventPublisher,
      idGenerator
    };
  };

  it('creates, charges, activates and publishes event for subscription', async () => {
    const { useCase, subscriptionRepo, paymentGateway, eventPublisher } = setup();

    const response = await useCase.execute({
      userId: 'user-1',
      planId: 'plan-1'
    });

    expect(subscriptionRepo.save).toHaveBeenCalledWith(expect.any(Subscription));
    expect(paymentGateway.charge).toHaveBeenCalledWith(
      expect.objectContaining({
        subscriptionId: 'sub-1',
        amount: 10,
        currency: 'USD'
      })
    );
    expect(subscriptionRepo.update).toHaveBeenCalledWith(expect.any(Subscription));
    expect(eventPublisher.publish).toHaveBeenCalled();

    expect(response.subscription.id).toBe('sub-1');
    expect(response.subscription.status).toBe('active');
  });

  it('throws when plan not found', async () => {
    const { useCase, planRepo } = setup();
    (planRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ userId: 'user-1', planId: 'missing-plan' })
    ).rejects.toThrow('Plan not found');
  });

  it('throws when user not found', async () => {
    const { useCase, userRepo } = setup();
    (userRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ userId: 'missing-user', planId: 'plan-1' })
    ).rejects.toThrow('User not found');
  });
});
