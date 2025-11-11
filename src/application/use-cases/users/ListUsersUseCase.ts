import { UserRepository } from '../../ports/user.repository';
import type { UserDto } from '../../dtos/users';
import type { User } from '../../../domain/entities/users/User';

export class ListUsersUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(): Promise<UserDto[]> {
    const entities = await this.users.findAll();
    return entities.map((user) => this.toDto(user));
  }

  private toDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive
    };
  }
}
