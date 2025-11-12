import type { UserRoleValue } from '../../../domain/shared/UserRole';

export interface ChangeUserRoleRequestDto {
  userId: string;
  role: UserRoleValue;
}
