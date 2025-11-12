import { UserRepository } from '../../ports/user.repository';
import { UserId } from '../../../domain/shared/UserId';
import type { ChangeUserRoleRequestDto, UserDto } from '../../dtos/users';
import type { User } from '../../../domain/entities/users/User';

export class ChangeUserRoleUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(request: ChangeUserRoleRequestDto): Promise<UserDto> {
    const user = await this.ensureUserExists(request.userId);
    user.changeRole(request.role);
    await this.users.update(user);
    return this.toDto(user);
  }

  private async ensureUserExists(userId: string): Promise<User> {
    const user = await this.users.findById(UserId.create(userId));
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  private toDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      role: user.role
    };
  }
}
