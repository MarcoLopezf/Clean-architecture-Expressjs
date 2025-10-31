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

export class PlansController {
  constructor(
    private readonly createPlan: CreatePlanUseCase,
    private readonly updatePlanDetails: UpdatePlanDetailsUseCase,
    private readonly updatePlanPrice: UpdatePlanPriceUseCase,
    private readonly togglePlanStatus: TogglePlanStatusUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreatePlanRequestDto = req.body;
      const result = await this.createPlan.execute(dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: UpdatePlanDetailsRequestDto = {
        planId: req.params.id,
        name: req.body?.name,
        description: req.body?.description
      };
      const result = await this.updatePlanDetails.execute(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  updatePrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: UpdatePlanPriceRequestDto = {
        planId: req.params.id,
        amount: req.body.amount,
        currency: req.body.currency
      };
      const result = await this.updatePlanPrice.execute(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: TogglePlanStatusRequestDto = {
        planId: req.params.id,
        isActive: Boolean(req.body?.isActive)
      };
      const result = await this.togglePlanStatus.execute(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
