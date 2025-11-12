export type UserRoleValue = 'admin' | 'operator' | 'user';

export class UserRole {
  private constructor(private readonly value: UserRoleValue) {}

  static readonly ADMIN = new UserRole('admin');
  static readonly OPERATOR = new UserRole('operator');
  static readonly USER = new UserRole('user');

  static create(value: UserRoleValue): UserRole {
    if (!UserRole.isValid(value)) {
      throw new Error(`Invalid user role: ${value as string}`);
    }
    return new UserRole(value);
  }

  static isValid(value: unknown): value is UserRoleValue {
    return value === 'admin' || value === 'operator' || value === 'user';
  }

  toString(): UserRoleValue {
    return this.value;
  }
}
