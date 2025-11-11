import { UserRepository } from '../../ports/user.repository';
import { UserId } from '../../../domain/shared/UserId';
import type { User } from '../../../domain/entities/users/User';
import type { UserDto } from '../../dtos/users';

export class GetUserByIdUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string): Promise<UserDto> {
    const user = await this.users.findById(UserId.create(userId));
    if (!user) {
      throw new Error('User not found');
    }

    return this.toDto(user);
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
