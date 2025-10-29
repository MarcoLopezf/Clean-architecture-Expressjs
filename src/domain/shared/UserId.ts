export class UserId {
  private constructor(private readonly value: string) {}

  static create(value: string): UserId {
    UserId.ensureValid(value);
    return new UserId(value);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private static ensureValid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('UserId cannot be empty.');
    }
  }
}
