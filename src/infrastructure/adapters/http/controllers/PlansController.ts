import { Request, Response, NextFunction } from 'express';
import {
  CreatePlanRequestDto,
  UpdatePlanDetailsRequestDto,
  UpdatePlanPriceRequestDto,
  TogglePlanStatusRequestDto
} from '../../../../application/dtos/plans';
import { CreatePlanUseCase } from '../../../../application/use-cases/plans/CreatePlanUseCase';
import { UpdatePlanDetailsUseCase } from '../../../../application/use-cases/plans/UpdatePlanDetailsUseCase';
import { UpdatePlanPriceUseCase } from '../../../../application/use-cases/plans/UpdatePlanPriceUseCase';
import { TogglePlanStatusUseCase } from '../../../../application/use-cases/plans/TogglePlanStatusUseCase';
import {
  type LoggerMetadata,
  type LoggerPort
} from '../../../../application/ports/logger.port';

type RequestWithId = Request & { id?: string };

export class PlansController {
  constructor(
    private readonly createPlan: CreatePlanUseCase,
    private readonly updatePlanDetails: UpdatePlanDetailsUseCase,
    private readonly updatePlanPrice: UpdatePlanPriceUseCase,
    private readonly togglePlanStatus: TogglePlanStatusUseCase,
    private readonly logger: LoggerPort
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    const log = this.childLogger('create', req);
    try {
      const dto: CreatePlanRequestDto = req.body;
      const result = await this.createPlan.execute(dto);
      log.info('Plan created', { planId: result.planId });
      res.status(201).json(result);
    } catch (error) {
      log.error('Failed to create plan', { error });
      next(error);
    }
  };

  updateDetails = async (req: Request, res: Response, next: NextFunction) => {
    const log = this.childLogger('updateDetails', req);
    try {
      const dto: UpdatePlanDetailsRequestDto = {
        planId: req.params.id,
        name: req.body?.name,
        description: req.body?.description
      };
      const result = await this.updatePlanDetails.execute(dto);
      log.info('Plan details updated', { planId: dto.planId });
      res.json(result);
    } catch (error) {
      log.error('Failed to update plan details', { error });
      next(error);
    }
  };

  updatePrice = async (req: Request, res: Response, next: NextFunction) => {
    const log = this.childLogger('updatePrice', req);
    try {
      const dto: UpdatePlanPriceRequestDto = {
        planId: req.params.id,
        amount: req.body.amount,
        currency: req.body.currency
      };
      const result = await this.updatePlanPrice.execute(dto);
      log.info('Plan price updated', { planId: dto.planId });
      res.json(result);
    } catch (error) {
      log.error('Failed to update plan price', { error });
      next(error);
    }
  };

  toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
    const log = this.childLogger('toggleStatus', req);
    try {
      const dto: TogglePlanStatusRequestDto = {
        planId: req.params.id,
        isActive: Boolean(req.body?.isActive)
      };
      const result = await this.togglePlanStatus.execute(dto);
      log.info('Plan status toggled', {
        planId: dto.planId,
        targetStatus: dto.isActive
      });
      res.json(result);
    } catch (error) {
      log.error('Failed to toggle plan status', { error });
      next(error);
    }
  };

  private childLogger(method: string, req: Request): LoggerPort {
    const metadata: LoggerMetadata = {
      method,
      requestId: (req as RequestWithId).id,
      planId: req.params?.id
    };
    return this.logger.child(metadata);
  }
}
