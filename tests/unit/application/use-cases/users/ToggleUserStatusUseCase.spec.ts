import { describe, expect, it, vi } from 'vitest';
import { ToggleUserStatusUseCase } from '../../../../../src/application/use-cases/users/ToggleUserStatusUseCase';
import { UserRepository } from '../../../../../src/application/ports/user.repository';
import { User } from '../../../../../src/domain/entities/users/User';

const activeUser = User.create({
  id: 'user-1',
  email: 'user@example.com',
  name: 'User Example'
});

const setup = () => {
  const userRepo: UserRepository = {
    findById: vi.fn().mockResolvedValue(activeUser),
    findByEmail: vi.fn(),
    save: vi.fn(),
    update: vi.fn().mockResolvedValue(undefined)
  };

  const useCase = new ToggleUserStatusUseCase(userRepo);

  return { useCase, userRepo };
};

describe('ToggleUserStatusUseCase', () => {
  it('deactivates the user when requested', async () => {
    const { useCase, userRepo } = setup();

    const result = await useCase.execute({ userId: 'user-1', isActive: false });

    expect(userRepo.update).toHaveBeenCalled();
    expect(result.isActive).toBe(false);
  });

  it('activates the user when requested', async () => {
    const { useCase, userRepo } = setup();
    activeUser.deactivate();

    const result = await useCase.execute({ userId: 'user-1', isActive: true });

    expect(userRepo.update).toHaveBeenCalled();
    expect(result.isActive).toBe(true);
  });

  it('throws when user not found', async () => {
    const { useCase, userRepo } = setup();
    (userRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ userId: 'missing', isActive: true })
    ).rejects.toThrow('User not found');
  });
});
