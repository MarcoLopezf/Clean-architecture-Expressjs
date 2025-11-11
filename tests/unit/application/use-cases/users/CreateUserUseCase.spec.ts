import { describe, expect, it, vi } from 'vitest';
import { CreateUserUseCase } from '../../../../../src/application/use-cases/users/CreateUserUseCase';
import { UserRepository } from '../../../../../src/application/ports/user.repository';
import { IdGenerator } from '../../../../../src/application/ports/id-generator';

const setup = () => {
  const userRepo: UserRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    update: vi.fn(),
    findAll: vi.fn()
  };

  const idGenerator: IdGenerator = {
    generate: vi.fn().mockReturnValue('user-1')
  };

  const useCase = new CreateUserUseCase(userRepo, idGenerator);

  return { useCase, userRepo, idGenerator };
};

describe('CreateUserUseCase', () => {
  it('creates a user when email is unique', async () => {
    const { useCase, userRepo } = setup();

    const response = await useCase.execute({
      email: 'user@example.com',
      name: 'User Example'
    });

    expect(userRepo.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(userRepo.save).toHaveBeenCalled();
    expect(response.userId).toBe('user-1');
  });

  it('throws when email already exists', async () => {
    const { useCase, userRepo } = setup();
    (userRepo.findByEmail as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'existing' } as any);

    await expect(
      useCase.execute({ email: 'user@example.com', name: 'User Example' })
    ).rejects.toThrow('User with provided email already exists.');
  });
});
