import { describe, expect, it } from 'vitest';
import { EmailAddress } from '../../../../../src/domain/shared/EmailAddress';
import { User } from '../../../../../src/domain/entities/users/User';
import { UserId } from '../../../../../src/domain/shared/UserId';
import { UserName } from '../../../../../src/domain/shared/UserName';

describe('User entity', () => {
  const createUser = () =>
    User.create({
      id: 'user-123',
      email: 'user@example.com',
      name: 'John Doe'
    });

  it('creates a user with value objects and default state', () => {
    const user = createUser();

    expect(user.userId).toBeInstanceOf(UserId);
    expect(user.emailAddress).toBeInstanceOf(EmailAddress);
    expect(user.userName).toBeInstanceOf(UserName);
    expect(user.isActive).toBe(true);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toEqual(user.createdAt);
  });

  it('updates the email and refreshes updatedAt', async () => {
    const user = createUser();
    const originalUpdatedAt = user.updatedAt;
    // ensure measurable difference if the clock has low resolution
    await new Promise((resolve) => setTimeout(resolve, 1));

    user.updateEmail('new@example.com');

    expect(user.email).toBe('new@example.com');
    expect(user.updatedAt).not.toBe(originalUpdatedAt);
    expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
      originalUpdatedAt.getTime()
    );
  });

  it('updates the name and refreshes updatedAt', async () => {
    const user = createUser();
    const originalUpdatedAt = user.updatedAt;
    await new Promise((resolve) => setTimeout(resolve, 1));

    user.updateName('Jane Doe');

    expect(user.name).toBe('Jane Doe');
    expect(user.updatedAt).not.toBe(originalUpdatedAt);
    expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
      originalUpdatedAt.getTime()
    );
  });

  it('deactivates and activates the user without redundant updates', async () => {
    const user = createUser();

    user.deactivate();
    const deactivatedTimestamp = user.updatedAt;

    expect(user.isActive).toBe(false);

    user.deactivate();
    expect(user.updatedAt).toEqual(deactivatedTimestamp);

    await new Promise((resolve) => setTimeout(resolve, 1));
    user.activate();
    expect(user.isActive).toBe(true);
    expect(user.updatedAt).not.toBe(deactivatedTimestamp);
    expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
      deactivatedTimestamp.getTime()
    );
  });

  it('serializes and rehydrates preserving invariants', () => {
    const user = createUser();
    user.updateEmail('rehydrated@example.com');
    user.updateName('Rehydrated User');
    user.deactivate();

    const primitives = user.toPrimitives();
    const rehydrated = User.fromPrimitives(primitives);

    expect(rehydrated.id).toBe(primitives.id);
    expect(rehydrated.email).toBe(primitives.email);
    expect(rehydrated.name).toBe(primitives.name);
    expect(rehydrated.isActive).toBe(primitives.isActive);
    expect(rehydrated.createdAt.getTime()).toBe(primitives.createdAt.getTime());
    expect(rehydrated.updatedAt.getTime()).toBe(primitives.updatedAt.getTime());
  });
});
