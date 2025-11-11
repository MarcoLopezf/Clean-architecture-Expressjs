import { User } from '../../../../domain/entities/users/User';
import { UserCreateProps, UserPrimitives } from '../../../../domain/entities/users/User';
import { UserRepository } from '../../../../application/ports/user.repository';
import { UserId } from '../../../../domain/shared/UserId';

export class InMemoryUserRepository implements UserRepository {
  private readonly storage = new Map<string, UserPrimitives>();

  constructor(initialUsers: UserPrimitives[] = []) {
    initialUsers.forEach((user) => {
      this.storage.set(user.id, user);
    });
  }

  async findById(id: UserId): Promise<User | null> {
    const user = this.storage.get(id.toString());
    return user ? User.fromPrimitives(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entry = Array.from(this.storage.values()).find(
      (user) => user.email === email
    );
    return entry ? User.fromPrimitives(entry) : null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.storage.values()).map((user) =>
      User.fromPrimitives(user)
    );
  }

  async save(user: User): Promise<void> {
    this.storage.set(user.id, user.toPrimitives());
  }

  async update(user: User): Promise<void> {
    await this.save(user);
  }

  seed(userProps: UserCreateProps): User {
    const user = User.create(userProps);
    this.storage.set(user.id, user.toPrimitives());
    return user;
  }
}
