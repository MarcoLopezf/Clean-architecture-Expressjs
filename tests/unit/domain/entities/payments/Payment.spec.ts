import { describe, expect, it } from 'vitest';
import { Payment } from '../../../../../src/domain/entities/payments/Payment';

describe('Payment entity', () => {
  const createPayment = () =>
    Payment.create({
      id: 'payment-123',
      subscriptionId: 'subscription-456',
      amount: 25,
      currency: 'usd'
    });

  it('creates a payment normalizing currency and defaulting status/date', () => {
    const payment = createPayment();

    expect(payment.id).toBe('payment-123');
    expect(payment.subscriptionId).toBe('subscription-456');
    expect(payment.amount).toBe(25);
    expect(payment.currency).toBe('USD');
    expect(payment.status).toBe('pending');
    expect(payment.createdAt).toBeInstanceOf(Date);
    expect(payment.processedAt).toBeUndefined();
  });

  it('marks a payment as completed once and records processed date', async () => {
    const payment = createPayment();

    expect(payment.status).toBe('pending');

    await new Promise((r) => setTimeout(r, 1));
    payment.markAsCompleted();

    expect(payment.status).toBe('completed');
    expect(payment.processedAt).toBeInstanceOf(Date);

    const processedAt = payment.processedAt;
    payment.markAsCompleted();

    expect(payment.processedAt).toBe(processedAt);
  });

  it('prevents completing after failure', () => {
    const payment = createPayment();
    payment.markAsFailed();

    expect(() => payment.markAsCompleted()).toThrowError(
      'Cannot mark a failed payment as completed.'
    );
  });

  it('prevents failing a completed payment', () => {
    const payment = createPayment();
    payment.markAsCompleted();

    expect(() => payment.markAsFailed()).toThrowError(
      'Cannot mark a completed payment as failed.'
    );
  });

  it('serializes to primitives and reuses value objects', () => {
    const payment = createPayment();
    payment.markAsCompleted(new Date('2024-01-01T00:00:00Z'));

    const primitives = payment.toPrimitives();
    expect(primitives).toMatchObject({
      id: 'payment-123',
      subscriptionId: 'subscription-456',
      amount: 25,
      currency: 'USD',
      status: 'completed'
    });
    expect(primitives.createdAt).toBeInstanceOf(Date);
    expect(primitives.processedAt?.toISOString()).toBe('2024-01-01T00:00:00.000Z');
  });
});
