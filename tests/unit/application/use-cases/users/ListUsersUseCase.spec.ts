import { describe, expect, it, vi } from 'vitest';
import { ListUsersUseCase } from '../../../../../src/application/use-cases/users/ListUsersUseCase';
import { UserRepository } from '../../../../../src/application/ports/user.repository';
import { User } from '../../../../../src/domain/entities/users/User';

const userA = User.create({
  id: 'user-a',
  email: 'a@example.com',
  name: 'User A'
});

const userB = User.create({
  id: 'user-b',
  email: 'b@example.com',
  name: 'User B'
});

describe('ListUsersUseCase', () => {
  it('returns every user from the repository', async () => {
    const userRepo: UserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      findAll: vi.fn().mockResolvedValue([userA, userB])
    };

    const useCase = new ListUsersUseCase(userRepo);

    const response = await useCase.execute();

    expect(userRepo.findAll).toHaveBeenCalled();
    expect(response).toHaveLength(2);
    expect(response[0].id).toBe('user-a');
    expect(response[1].id).toBe('user-b');
  });
});
