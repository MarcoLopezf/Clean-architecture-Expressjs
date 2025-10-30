import { describe, expect, it } from 'vitest';
import { Plan } from '../../../../../src/domain/entities/plans/Plan';
import { PlanId } from '../../../../../src/domain/shared/PlanId';
import { Price } from '../../../../../src/domain/shared/Price';

const baseProps = {
  id: 'plan-123',
  name: 'Starter Plan',
  description: 'Initial plan description',
  amount: 10,
  currency: 'usd',
  billingCycleUnit: 'month' as const,
  billingCycleInterval: 1
};

const createPlan = () => Plan.create(baseProps);

describe('Plan entity', () => {
  it('creates a plan with normalized data and value objects', () => {
    const plan = createPlan();

    expect(plan.planId).toBeInstanceOf(PlanId);
    expect(plan.price).toBeInstanceOf(Price);
    expect(plan.amount).toBe(10);
    expect(plan.currency).toBe('USD');
    expect(plan.billingCycle.unit).toBe('month');
    expect(plan.billingCycle.interval).toBe(1);
    expect(plan.isActive).toBe(true);
    expect(plan.createdAt).toBeInstanceOf(Date);
    expect(plan.updatedAt).toEqual(plan.createdAt);
  });

  it('renames and updates description with touch semantics', async () => {
    const plan = createPlan();

    await new Promise((resolve) => setTimeout(resolve, 1));
    plan.rename('Pro Plan');
    expect(plan.name).toBe('Pro Plan');

    const renamedTimestamp = plan.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 1));
    plan.updateDescription('Updated description');
    expect(plan.description).toBe('Updated description');
    expect(plan.updatedAt.getTime()).toBeGreaterThanOrEqual(
      renamedTimestamp.getTime()
    );
  });

  it('updates price and remains consistent with value object', async () => {
    const plan = createPlan();

    await new Promise((resolve) => setTimeout(resolve, 1));
    plan.updatePrice(25, 'eur');

    expect(plan.amount).toBe(25);
    expect(plan.currency).toBe('EUR');
    expect(plan.price).toBeInstanceOf(Price);
  });

  it('handles activation toggles without redundant work', async () => {
    const plan = createPlan();

    plan.deactivate();
    const deactivatedAt = plan.updatedAt;
    expect(plan.isActive).toBe(false);

    plan.deactivate();
    expect(plan.updatedAt).toEqual(deactivatedAt);

    await new Promise((resolve) => setTimeout(resolve, 1));
    plan.activate();
    expect(plan.isActive).toBe(true);
    expect(plan.updatedAt.getTime()).toBeGreaterThanOrEqual(
      deactivatedAt.getTime()
    );
  });

  it('serializes and rehydrates while preserving invariants', () => {
    const plan = createPlan();
    plan.updatePrice(20, 'usd');
    plan.updateDescription('Another description');
    plan.deactivate();

    const primitives = plan.toPrimitives();
    const rehydrated = Plan.fromPrimitives(primitives);

    expect(rehydrated.id).toBe(primitives.id);
    expect(rehydrated.amount).toBe(primitives.amount);
    expect(rehydrated.currency).toBe(primitives.currency);
    expect(rehydrated.billingCycle.unit).toBe(primitives.billingCycleUnit);
    expect(rehydrated.billingCycle.interval).toBe(
      primitives.billingCycleInterval
    );
    expect(rehydrated.isActive).toBe(primitives.isActive);
    expect(rehydrated.updatedAt.getTime()).toBe(primitives.updatedAt.getTime());
  });
});
