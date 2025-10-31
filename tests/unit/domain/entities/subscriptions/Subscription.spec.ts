import { describe, expect, it } from 'vitest';
import { Plan } from '../../../../../src/domain/entities/plans/Plan';
import { Subscription } from '../../../../../src/domain/entities/subscriptions/Subscription';
import { SubscriptionStatusValue } from '../../../../../src/domain/shared/SubscriptionStatus';

const createPlan = (overrides?: Partial<Parameters<typeof Plan.create>[0]>) =>
  Plan.create({
    id: 'plan-basic',
    name: 'Basic',
    description: 'Basic plan',
    amount: 15,
    currency: 'usd',
    billingCycleUnit: 'month',
    billingCycleInterval: 1,
    ...overrides
  });

const createSubscription = (
  overrides?: Partial<Parameters<typeof Subscription.create>[0]>,
  options?: { autoActivate?: boolean }
) => {
  const subscription = Subscription.create({
    id: 'sub-123',
    userId: 'user-456',
    plan: createPlan(),
    ...overrides
  });

  if (options?.autoActivate ?? true) {
    subscription.activate();
  }

  return subscription;
};

describe('Subscription entity', () => {
  it('creates a subscription defaulting to pending status and calculated end date', () => {
    const subscription = createSubscription(undefined, { autoActivate: false });

    expect(subscription.id).toBe('sub-123');
    expect(subscription.userId).toBe('user-456');
    expect(subscription.status).toBe(SubscriptionStatusValue.PENDING);
    expect(subscription.startDate).toBeInstanceOf(Date);
    expect(subscription.endDate.getTime()).toBeGreaterThan(
      subscription.startDate.getTime()
    );
  });

  it('renews a subscription updating dates and status', () => {
    const subscription = createSubscription();
    const previousEnd = subscription.endDate;

    subscription.renew();

    expect(subscription.startDate.getTime()).toBe(previousEnd.getTime());
    expect(subscription.endDate.getTime()).toBeGreaterThan(
      subscription.startDate.getTime()
    );
    expect(subscription.status).toBe(SubscriptionStatusValue.ACTIVE);
  });

  it('throws when renewing a cancelled subscription', () => {
    const subscription = createSubscription();
    subscription.cancel();

    expect(subscription.status).toBe(SubscriptionStatusValue.CANCELLED);
    expect(() => subscription.renew()).toThrowError(
      'Cannot renew a cancelled subscription.'
    );
  });

  it('throws when renewing a pending subscription', () => {
    const subscription = createSubscription(undefined, { autoActivate: false });

    expect(() => subscription.renew()).toThrowError(
      'Cannot renew a pending subscription.'
    );
  });

  it('cancels with effective date and prevents duplicates', () => {
    const subscription = createSubscription();
    const cancellationDate = new Date(subscription.startDate.getTime() + 1000);

    subscription.cancel(cancellationDate);

    expect(subscription.status).toBe(SubscriptionStatusValue.CANCELLED);
    expect(subscription.endDate.getTime()).toBe(cancellationDate.getTime());

    subscription.cancel(cancellationDate);
    expect(subscription.endDate.getTime()).toBe(cancellationDate.getTime());
  });

  it('pauses and resumes respecting status transitions', () => {
    const subscription = createSubscription();

    subscription.pause();
    expect(subscription.status).toBe(SubscriptionStatusValue.PAUSED);

    subscription.pause();
    expect(subscription.status).toBe(SubscriptionStatusValue.PAUSED);

    subscription.resume();
    expect(subscription.status).toBe(SubscriptionStatusValue.ACTIVE);
  });

  it('prevents pausing while pending', () => {
    const subscription = createSubscription(undefined, { autoActivate: false });

    expect(() => subscription.pause()).toThrowError(
      'Cannot pause a pending subscription.'
    );
  });

  it('changes plan and recalculates billing window', () => {
    const subscription = createSubscription();
    const newPlan = createPlan({
      id: 'plan-premium',
      billingCycleUnit: 'year',
      billingCycleInterval: 1,
      amount: 120
    });

    const newStart = new Date(subscription.startDate.getTime() + 1000);
    subscription.changePlan(newPlan, newStart);

    expect(subscription.plan.id).toBe('plan-premium');
    expect(subscription.startDate.getTime()).toBe(newStart.getTime());
    const diffYears =
      subscription.endDate.getFullYear() - subscription.startDate.getFullYear();
    expect(diffYears).toBeGreaterThanOrEqual(1);
  });

  it('serializes and rehydrates via primitives', () => {
    const subscription = createSubscription();
    subscription.pause();

    const primitives = subscription.toPrimitives();
    const restored = Subscription.fromPrimitives(primitives);

    expect(restored.id).toBe(primitives.id);
    expect(restored.userId).toBe(primitives.userId);
    expect(restored.status).toBe(primitives.status);
    expect(restored.startDate.getTime()).toBe(primitives.startDate.getTime());
    expect(restored.plan.id).toBe(primitives.plan.id);
  });
});
