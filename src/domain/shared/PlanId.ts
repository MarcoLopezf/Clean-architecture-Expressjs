export class PlanId {
  private constructor(private readonly value: string) {}

  static create(value: string): PlanId {
    PlanId.ensureValid(value);
    return new PlanId(value);
  }

  equals(other: PlanId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private static ensureValid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('PlanId cannot be empty.');
    }
  }
}
