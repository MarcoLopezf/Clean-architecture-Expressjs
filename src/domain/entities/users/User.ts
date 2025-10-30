import { EmailAddress } from '../../shared/EmailAddress';
import { UserId } from '../../shared/UserId';
import { UserName } from '../../shared/UserName';

interface UserProps {
  readonly id: UserId;
  email: EmailAddress;
  name: UserName;
  readonly createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface UserCreateProps {
  id: string;
  email: string;
  name: string;
  createdAt?: Date;
  isActive?: boolean;
}

export interface UserPrimitives {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserCreateProps): User {
    const createdAt = User.cloneDate(props.createdAt ?? new Date());
    const userProps: UserProps = {
      id: UserId.create(props.id),
      email: EmailAddress.create(props.email),
      name: UserName.create(props.name),
      createdAt,
      updatedAt: createdAt,
      isActive: props.isActive ?? true
    };

    return new User(userProps);
  }

  static fromPrimitives(primitives: UserPrimitives): User {
    return new User({
      id: UserId.create(primitives.id),
      email: EmailAddress.create(primitives.email),
      name: UserName.create(primitives.name),
      createdAt: User.cloneDate(primitives.createdAt),
      updatedAt: User.cloneDate(primitives.updatedAt),
      isActive: primitives.isActive
    });
  }

  get id(): string {
    return this.props.id.toString();
  }

  get userId(): UserId {
    return this.props.id;
  }

  get email(): string {
    return this.props.email.toString();
  }

  get emailAddress(): EmailAddress {
    return this.props.email;
  }

  get name(): string {
    return this.props.name.toString();
  }

  get userName(): UserName {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  updateEmail(newEmail: string): void {
    this.props.email = EmailAddress.create(newEmail);
    this.touch();
  }

  updateName(newName: string): void {
    this.props.name = UserName.create(newName);
    this.touch();
  }

  deactivate(): void {
    if (!this.props.isActive) {
      return;
    }

    this.props.isActive = false;
    this.touch();
  }

  activate(): void {
    if (this.props.isActive) {
      return;
    }

    this.props.isActive = true;
    this.touch();
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      isActive: this.props.isActive
    };
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  private static cloneDate(date: Date): Date {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new Error('Provided value is not a valid date.');
    }

    return new Date(date.getTime());
  }
}
