import express, { Router } from 'express';
import { SubscriptionsController } from './controllers/SubscriptionsController';
import { UsersController } from './controllers/UsersController';
import { PlansController } from './controllers/PlansController';
import { HttpUseCaseRegistry } from './types';
import { type LoggerPort } from '../../../application/ports/logger.port';

export const buildRouter = (
  useCases: HttpUseCaseRegistry,
  logger: LoggerPort
): Router => {
  const router = express.Router();

  const subscriptionsController = new SubscriptionsController(
    useCases.createSubscription,
    useCases.renewSubscription,
    useCases.cancelSubscription,
    useCases.pauseSubscription,
    useCases.resumeSubscription,
    logger.child({ controller: 'SubscriptionsController' })
  );

  const usersController = new UsersController(
    useCases.createUser,
    useCases.updateUserProfile,
    useCases.toggleUserStatus,
    logger.child({ controller: 'UsersController' })
  );

  const plansController = new PlansController(
    useCases.createPlan,
    useCases.updatePlanDetails,
    useCases.updatePlanPrice,
    useCases.togglePlanStatus,
    logger.child({ controller: 'PlansController' })
  );

  router.post('/subscriptions', subscriptionsController.create);
  router.patch('/subscriptions/:id/renew', subscriptionsController.renew);
  router.delete('/subscriptions/:id', subscriptionsController.cancel);
  router.patch('/subscriptions/:id/pause', subscriptionsController.pause);
  router.patch('/subscriptions/:id/resume', subscriptionsController.resume);

  router.post('/users', usersController.create);
  router.patch('/users/:id', usersController.updateProfile);
  router.post('/users/:id/status', usersController.toggleStatus);

  router.post('/plans', plansController.create);
  router.patch('/plans/:id', plansController.updateDetails);
  router.patch('/plans/:id/price', plansController.updatePrice);
  router.patch('/plans/:id/status', plansController.toggleStatus);

  return router;
};
