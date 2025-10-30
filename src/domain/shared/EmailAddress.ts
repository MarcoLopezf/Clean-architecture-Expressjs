export class EmailAddress {
  private constructor(private readonly value: string) {}

  static create(value: string): EmailAddress {
    EmailAddress.ensureValid(value);
    return new EmailAddress(value.toLowerCase());
  }

  equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private static ensureValid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Email cannot be empty.');
    }

    const normalized = value.trim();
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalized)) {
      throw new Error('Email must be a valid email address.');
    }
  }
}
