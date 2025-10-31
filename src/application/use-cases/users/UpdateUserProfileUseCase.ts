import { User } from '../../../domain/entities/users/User';
import { UserId } from '../../../domain/shared/UserId';
import { UserRepository } from '../../ports/user.repository';
import { UpdateUserProfileRequestDto, UserDto } from '../../dtos/users';

export class UpdateUserProfileUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(request: UpdateUserProfileRequestDto): Promise<UserDto> {
    const user = await this.ensureUserExists(request.userId);

    if (request.email) {
      const existing = await this.users.findByEmail(request.email);
      if (existing && existing.id !== user.id) {
        throw new Error('Email is already in use by another user.');
      }
      user.updateEmail(request.email);
    }

    if (request.name) {
      user.updateName(request.name);
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
      isActive: user.isActive
    };
  }
}
