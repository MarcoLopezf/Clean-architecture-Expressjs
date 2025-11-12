import { User } from '../../../domain/entities/users/User';
import { UserId } from '../../../domain/shared/UserId';
import { UserRepository } from '../../ports/user.repository';
import { ToggleUserStatusRequestDto, UserDto } from '../../dtos/users';

export class ToggleUserStatusUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(request: ToggleUserStatusRequestDto): Promise<UserDto> {
    const user = await this.ensureUserExists(request.userId);

    if (request.isActive) {
      user.activate();
    } else {
      user.deactivate();
    }

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
