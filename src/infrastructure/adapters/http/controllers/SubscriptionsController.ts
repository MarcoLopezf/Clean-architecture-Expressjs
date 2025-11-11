import { Request, Response, NextFunction } from 'express';
import {
  CreateSubscriptionRequestDto,
  RenewSubscriptionRequestDto,
  CancelSubscriptionRequestDto,
  PauseSubscriptionRequestDto,
  ResumeSubscriptionRequestDto
} from '../../../../application/dtos/subscriptions';
import { CreateSubscriptionUseCase } from '../../../../application/use-cases/subscriptions/CreateSubscriptionUseCase';
import { RenewSubscriptionUseCase } from '../../../../application/use-cases/subscriptions/RenewSubscriptionUseCase';
import { CancelSubscriptionUseCase } from '../../../../application/use-cases/subscriptions/CancelSubscriptionUseCase';
import { PauseSubscriptionUseCase } from '../../../../application/use-cases/subscriptions/PauseSubscriptionUseCase';
import { ResumeSubscriptionUseCase } from '../../../../application/use-cases/subscriptions/ResumeSubscriptionUseCase';

export class SubscriptionsController {
  constructor(
    private readonly createSubscription: CreateSubscriptionUseCase,
    private readonly renewSubscription: RenewSubscriptionUseCase,
    private readonly cancelSubscription: CancelSubscriptionUseCase,
    private readonly pauseSubscription: PauseSubscriptionUseCase,
    private readonly resumeSubscription: ResumeSubscriptionUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreateSubscriptionRequestDto = {
        ...req.body,
        startDate: req.body?.startDate ? new Date(req.body.startDate) : undefined
      };
      const result = await this.createSubscription.execute(dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  renew = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: RenewSubscriptionRequestDto = {
        subscriptionId: req.params.id,
        effectiveDate: req.body?.effectiveDate ? new Date(req.body.effectiveDate) : undefined
      };
      const result = await this.renewSubscription.execute(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CancelSubscriptionRequestDto = {
        subscriptionId: req.params.id,
        effectiveDate: req.body?.effectiveDate ? new Date(req.body.effectiveDate) : undefined
      };
      const result = await this.cancelSubscription.execute(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  pause = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: PauseSubscriptionRequestDto = { subscriptionId: req.params.id };
      const result = await this.pauseSubscription.execute(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  resume = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: ResumeSubscriptionRequestDto = { subscriptionId: req.params.id };
      const result = await this.resumeSubscription.execute(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
