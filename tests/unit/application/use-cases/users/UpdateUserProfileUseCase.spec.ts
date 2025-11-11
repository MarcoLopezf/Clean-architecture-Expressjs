import { describe, expect, it, vi } from 'vitest';
import { UpdateUserProfileUseCase } from '../../../../../src/application/use-cases/users/UpdateUserProfileUseCase';
import { UserRepository } from '../../../../../src/application/ports/user.repository';
import { User } from '../../../../../src/domain/entities/users/User';

const existingUser = User.create({
  id: 'user-1',
  email: 'user@example.com',
  name: 'User Example'
});

const setup = () => {
  const userRepo: UserRepository = {
    findById: vi.fn().mockResolvedValue(existingUser),
    findByEmail: vi.fn().mockResolvedValue(null),
    save: vi.fn(),
    update: vi.fn().mockResolvedValue(undefined),
    findAll: vi.fn()
  };

  const useCase = new UpdateUserProfileUseCase(userRepo);

  return { useCase, userRepo };
};

describe('UpdateUserProfileUseCase', () => {
  it('updates email and name when provided', async () => {
    const { useCase, userRepo } = setup();

    const result = await useCase.execute({
      userId: 'user-1',
      email: 'new@example.com',
      name: 'New Name'
    });

    expect(userRepo.update).toHaveBeenCalled();
    expect(result.email).toBe('new@example.com');
    expect(result.name).toBe('New Name');
  });

  it('throws when user not found', async () => {
    const { useCase, userRepo } = setup();
    (userRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ userId: 'missing', name: 'Any' })
    ).rejects.toThrow('User not found');
  });

  it('throws when email already taken by another user', async () => {
    const { useCase, userRepo } = setup();
    (userRepo.findByEmail as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      User.create({ id: 'user-2', email: 'taken@example.com', name: 'Other' })
    );

    await expect(
      useCase.execute({ userId: 'user-1', email: 'taken@example.com' })
    ).rejects.toThrow('Email is already in use by another user.');
  });
});
