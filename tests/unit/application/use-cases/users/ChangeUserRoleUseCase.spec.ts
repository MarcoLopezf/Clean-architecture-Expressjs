import { describe, expect, it, vi } from 'vitest';
import { ChangeUserRoleUseCase } from '../../../../../src/application/use-cases/users/ChangeUserRoleUseCase';
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
    findByEmail: vi.fn(),
    save: vi.fn(),
    update: vi.fn().mockResolvedValue(undefined),
    findAll: vi.fn()
  };

  const useCase = new ChangeUserRoleUseCase(userRepo);

  return { useCase, userRepo };
};

describe('ChangeUserRoleUseCase', () => {
  it('updates the user role', async () => {
    const { useCase, userRepo } = setup();

    const result = await useCase.execute({ userId: 'user-1', role: 'operator' });

    expect(userRepo.update).toHaveBeenCalled();
    expect(result.role).toBe('operator');
  });

  it('throws when user not found', async () => {
    const { useCase, userRepo } = setup();
    (userRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ userId: 'missing', role: 'admin' })
    ).rejects.toThrow('User not found');
  });
});
