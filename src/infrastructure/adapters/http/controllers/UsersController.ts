import { Request, Response, NextFunction } from 'express';
import {
  CreateUserRequestDto,
  UpdateUserProfileRequestDto,
  ToggleUserStatusRequestDto
} from '../../../../application/dtos/users';
import { CreateUserUseCase } from '../../../../application/use-cases/users/CreateUserUseCase';
import { UpdateUserProfileUseCase } from '../../../../application/use-cases/users/UpdateUserProfileUseCase';
import { ToggleUserStatusUseCase } from '../../../../application/use-cases/users/ToggleUserStatusUseCase';

export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly updateUserProfile: UpdateUserProfileUseCase,
    private readonly toggleUserStatus: ToggleUserStatusUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreateUserRequestDto = req.body;
      const result = await this.createUser.execute(dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: UpdateUserProfileRequestDto = {
        userId: req.params.id,
        email: req.body?.email,
        name: req.body?.name
      };
      const result = await this.updateUserProfile.execute(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: ToggleUserStatusRequestDto = {
        userId: req.params.id,
        isActive: Boolean(req.body?.isActive)
      };
      const result = await this.toggleUserStatus.execute(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
