import { User } from '../../../domain/entities/users/User';
import { UserRepository } from '../../ports/user.repository';
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
  UserDto
} from '../../dtos/users';
import { IdGenerator } from '../../ports/id-generator';

export class CreateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(request: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    const existing = await this.users.findByEmail(request.email);
    if (existing) {
      throw new Error('User with provided email already exists.');
    }

    const user = User.create({
      id: this.idGenerator.generate(),
      email: request.email,
      name: request.name
    });

    await this.users.save(user);

    return {
      userId: user.id
    };
  }
}
