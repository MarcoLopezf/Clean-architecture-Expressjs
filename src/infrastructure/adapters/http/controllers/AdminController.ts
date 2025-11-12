import { Request, Response, NextFunction } from 'express';
import { ChangeUserRoleUseCase } from '../../../../application/use-cases/users/ChangeUserRoleUseCase';
import { UserRole } from '../../../../domain/shared/UserRole';
import { type LoggerPort } from '../../../../application/ports/logger.port';

const SETUP_HEADER = 'x-setup-token';
const ADMIN_HEADER = 'x-admin-token';

export class AdminController {
  constructor(
    private readonly changeUserRole: ChangeUserRoleUseCase,
    private readonly logger: LoggerPort
  ) {}

  bootstrapAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureTokenMatches(
        req.get(SETUP_HEADER),
        process.env.SETUP_ADMIN_TOKEN,
        'Setup'
      );

      const userId = req.body?.userId;
      if (!userId || typeof userId !== 'string') {
        throw new Error('Field "userId" is required.');
      }

      const result = await this.changeUserRole.execute({
        userId,
        role: 'admin'
      });

      this.logger.info('Bootstrap admin executed', { userId });
      res.status(200).json({ user: result });
    } catch (error) {
      this.logger.error('Bootstrap admin failed', { error });
      next(error);
    }
  };

  changeRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureTokenMatches(
        req.get(ADMIN_HEADER),
        process.env.ADMIN_API_TOKEN,
        'Admin'
      );

      const role = req.body?.role;
      if (!UserRole.isValid(role)) {
        throw new Error('Field "role" must be one of admin/operator/user.');
      }

      const result = await this.changeUserRole.execute({
        userId: req.params.id,
        role
      });

      this.logger.info('User role changed', {
        targetUserId: req.params.id,
        role
      });
      res.json({ user: result });
    } catch (error) {
      this.logger.error('Change user role failed', { error });
      next(error);
    }
  };

  private ensureTokenMatches(
    provided: string | undefined | null,
    expected: string | undefined,
    label: string
  ): void {
    if (!expected) {
      throw new Error(`${label} token is not configured on the server.`);
    }

    if (!provided || provided !== expected) {
      const err = new Error(`${label} token is invalid.`);
      (err as any).status = 403;
      throw err;
    }
  }
}
