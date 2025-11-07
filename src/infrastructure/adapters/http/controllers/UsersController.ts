import { Request, Response, NextFunction } from 'express';
import {
  CreateUserRequestDto,
  UpdateUserProfileRequestDto,
  ToggleUserStatusRequestDto
} from '../../../../application/dtos/users';
import { CreateUserUseCase } from '../../../../application/use-cases/users/CreateUserUseCase';
import { UpdateUserProfileUseCase } from '../../../../application/use-cases/users/UpdateUserProfileUseCase';
import { ToggleUserStatusUseCase } from '../../../../application/use-cases/users/ToggleUserStatusUseCase';
import {
  type LoggerMetadata,
  type LoggerPort
} from '../../../../application/ports/logger.port';

type RequestWithId = Request & { id?: string };

export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly updateUserProfile: UpdateUserProfileUseCase,
    private readonly toggleUserStatus: ToggleUserStatusUseCase,
    private readonly logger: LoggerPort
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    const log = this.childLogger('create', req);
    try {
      const dto: CreateUserRequestDto = req.body;
      const result = await this.createUser.execute(dto);
      log.info('User created', { userId: result.userId });
      res.status(201).json(result);
    } catch (error) {
      log.error('Failed to create user', { error });
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    const log = this.childLogger('updateProfile', req);
    try {
      const dto: UpdateUserProfileRequestDto = {
        userId: req.params.id,
        email: req.body?.email,
        name: req.body?.name
      };
      const result = await this.updateUserProfile.execute(dto);
      log.info('User profile updated', { userId: dto.userId });
      res.json(result);
    } catch (error) {
      log.error('Failed to update user profile', { error });
      next(error);
    }
  };

  toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
    const log = this.childLogger('toggleStatus', req);
    try {
      const dto: ToggleUserStatusRequestDto = {
        userId: req.params.id,
        isActive: Boolean(req.body?.isActive)
      };
      const result = await this.toggleUserStatus.execute(dto);
      log.info('User status toggled', {
        userId: dto.userId,
        targetStatus: dto.isActive
      });
      res.json(result);
    } catch (error) {
      log.error('Failed to toggle user status', { error });
      next(error);
    }
  };

  private childLogger(method: string, req: Request): LoggerPort {
    const metadata: LoggerMetadata = {
      method,
      requestId: (req as RequestWithId).id,
      userId: req.params?.id
    };
    return this.logger.child(metadata);
  }
}
