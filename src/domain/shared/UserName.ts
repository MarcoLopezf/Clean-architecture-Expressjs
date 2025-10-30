export class UserName {
  private constructor(private readonly value: string) {}

  static create(value: string): UserName {
    UserName.ensureValid(value);
    return new UserName(value.trim());
  }

  equals(other: UserName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private static ensureValid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('User name cannot be empty.');
    }

    const trimmed = value.trim();
    if (trimmed.length < 2) {
      throw new Error('User name must be at least 2 characters long.');
    }
  }
}
