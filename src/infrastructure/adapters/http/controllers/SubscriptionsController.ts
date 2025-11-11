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
import { ListSubscriptionsUseCase } from '../../../../application/use-cases/subscriptions/ListSubscriptionsUseCase';
import { GetSubscriptionByIdUseCase } from '../../../../application/use-cases/subscriptions/GetSubscriptionByIdUseCase';
import {
  type LoggerMetadata,
  type LoggerPort
} from '../../../../application/ports/logger.port';

type RequestWithId = Request & { id?: string };

export class SubscriptionsController {
  constructor(
    private readonly createSubscription: CreateSubscriptionUseCase,
    private readonly renewSubscription: RenewSubscriptionUseCase,
    private readonly cancelSubscription: CancelSubscriptionUseCase,
    private readonly pauseSubscription: PauseSubscriptionUseCase,
    private readonly resumeSubscription: ResumeSubscriptionUseCase,
    private readonly listSubscriptions: ListSubscriptionsUseCase,
    private readonly getSubscriptionById: GetSubscriptionByIdUseCase,
    private readonly logger: LoggerPort
  ) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    const log = this.childLogger('list', req);
    try {
      const subscriptions = await this.listSubscriptions.execute();
      log.info('Subscriptions listed', { count: subscriptions.length });
      res.json({ subscriptions });
    } catch (error) {
      log.error('Failed to list subscriptions', { error });
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    const log = this.childLogger('getById', req);
    try {
      const subscription = await this.getSubscriptionById.execute(req.params.id);
      log.info('Subscription retrieved', { subscriptionId: subscription.id });
      res.json({ subscription });
    } catch (error) {
      log.error('Failed to get subscription', { error });
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    const log = this.childLogger('create', req);
    try {
      const dto: CreateSubscriptionRequestDto = {
        ...req.body,
        startDate: req.body?.startDate ? new Date(req.body.startDate) : undefined
      };
      const result = await this.createSubscription.execute(dto);
      log.info('Subscription created', { subscriptionId: result.subscription });
      res.status(201).json(result);
    } catch (error) {
      log.error('Failed to create subscription', { error });
      next(error);
    }
  };

  renew = async (req: Request, res: Response, next: NextFunction) => {
    const log = this.childLogger('renew', req);
    try {
      const dto: RenewSubscriptionRequestDto = {
        subscriptionId: req.params.id,
        effectiveDate: req.body?.effectiveDate ? new Date(req.body.effectiveDate) : undefined
      };
      const result = await this.renewSubscription.execute(dto);
      log.info('Subscription renewed', { subscriptionId: dto.subscriptionId });
      res.json(result);
    } catch (error) {
      log.error('Failed to renew subscription', { error });
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction) => {
    const log = this.childLogger('cancel', req);
    try {
      const dto: CancelSubscriptionRequestDto = {
        subscriptionId: req.params.id,
        effectiveDate: req.body?.effectiveDate ? new Date(req.body.effectiveDate) : undefined
      };
      const result = await this.cancelSubscription.execute(dto);
      log.info('Subscription cancelled', { subscriptionId: dto.subscriptionId });
      res.json(result);
    } catch (error) {
      log.error('Failed to cancel subscription', { error });
      next(error);
    }
  };

  pause = async (req: Request, res: Response, next: NextFunction) => {
    const log = this.childLogger('pause', req);
    try {
      const dto: PauseSubscriptionRequestDto = { subscriptionId: req.params.id };
      const result = await this.pauseSubscription.execute(dto);
      log.info('Subscription paused', { subscriptionId: dto.subscriptionId });
      res.json(result);
    } catch (error) {
      log.error('Failed to pause subscription', { error });
      next(error);
    }
  };

  resume = async (req: Request, res: Response, next: NextFunction) => {
    const log = this.childLogger('resume', req);
    try {
      const dto: ResumeSubscriptionRequestDto = { subscriptionId: req.params.id };
      const result = await this.resumeSubscription.execute(dto);
      log.info('Subscription resumed', { subscriptionId: dto.subscriptionId });
      res.json(result);
    } catch (error) {
      log.error('Failed to resume subscription', { error });
      next(error);
    }
  };

  private childLogger(method: string, req: Request): LoggerPort {
    const metadata: LoggerMetadata = {
      method,
      requestId: (req as RequestWithId).id,
      subscriptionId: req.params?.id
    };
    return this.logger.child(metadata);
  }
}
