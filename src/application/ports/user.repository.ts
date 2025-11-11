import type { User } from '../../domain/entities/users/User';
import type { UserId } from '../../domain/shared/UserId';

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  findAll(): Promise<User[]>;
}
