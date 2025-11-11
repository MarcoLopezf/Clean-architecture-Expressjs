import { describe, expect, it, vi } from 'vitest';
import { GetUserByIdUseCase } from '../../../../../src/application/use-cases/users/GetUserByIdUseCase';
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
    update: vi.fn(),
    findAll: vi.fn()
  };

  const useCase = new GetUserByIdUseCase(userRepo);

  return { useCase, userRepo };
};

describe('GetUserByIdUseCase', () => {
  it('returns the user DTO when found', async () => {
    const { useCase, userRepo } = setup();

    const result = await useCase.execute('user-1');

    expect(userRepo.findById).toHaveBeenCalledWith(expect.anything());
    expect(result.id).toBe('user-1');
    expect(result.email).toBe('user@example.com');
  });

  it('throws when the user does not exist', async () => {
    const { useCase, userRepo } = setup();
    (userRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(useCase.execute('missing')).rejects.toThrow('User not found');
  });
});
