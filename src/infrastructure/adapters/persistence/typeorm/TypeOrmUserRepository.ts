import type { DataSource, Repository } from 'typeorm';
import { UserRepository } from '../../../../application/ports/user.repository';
import { User } from '../../../../domain/entities/users/User';
import type { UserPrimitives } from '../../../../domain/entities/users/User';
import type { UserId } from '../../../../domain/shared/UserId';
import { UserEntity } from '../../../database/entities/UserEntity';

export class TypeOrmUserRepository implements UserRepository {
  private readonly userRepo: Repository<UserEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.userRepo = dataSource.getRepository(UserEntity);
  }

  async findById(id: UserId): Promise<User | null> {
    const entity = await this.userRepo.findOne({ where: { id: id.toString() } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.userRepo.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<User[]> {
    const entities = await this.userRepo.find();
    return entities.map((entity) => this.toDomain(entity));
  }

  async save(user: User): Promise<void> {
    await this.persist(user.toPrimitives());
  }

  async update(user: User): Promise<void> {
    await this.persist(user.toPrimitives());
  }

  private async persist(user: UserPrimitives): Promise<void> {
    const entity = this.userRepo.create({
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
    await this.userRepo.save(entity);
  }

  private toDomain(entity: UserEntity): User {
    return User.fromPrimitives({
      id: entity.id,
      email: entity.email,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      isActive: entity.isActive
    });
  }
}
