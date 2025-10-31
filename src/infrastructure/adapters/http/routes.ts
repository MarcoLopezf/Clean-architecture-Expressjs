import express, { Router } from 'express';
import { SubscriptionsController } from './controllers/SubscriptionsController';
import { UsersController } from './controllers/UsersController';
import { PlansController } from './controllers/PlansController';
import { HttpUseCaseRegistry } from './types';

export const buildRouter = (useCases: HttpUseCaseRegistry): Router => {
  const router = express.Router();

  const subscriptionsController = new SubscriptionsController(
    useCases.createSubscription,
    useCases.renewSubscription,
    useCases.cancelSubscription,
    useCases.pauseSubscription,
    useCases.resumeSubscription
  );

  const usersController = new UsersController(
    useCases.createUser,
    useCases.updateUserProfile,
    useCases.toggleUserStatus
  );

  const plansController = new PlansController(
    useCases.createPlan,
    useCases.updatePlanDetails,
    useCases.updatePlanPrice,
    useCases.togglePlanStatus
  );

  router.post('/subscriptions', subscriptionsController.create);
  router.post('/subscriptions/:id/renew', subscriptionsController.renew);
  router.post('/subscriptions/:id/cancel', subscriptionsController.cancel);
  router.post('/subscriptions/:id/pause', subscriptionsController.pause);
  router.post('/subscriptions/:id/resume', subscriptionsController.resume);

  router.post('/users', usersController.create);
  router.patch('/users/:id', usersController.updateProfile);
  router.post('/users/:id/status', usersController.toggleStatus);

  router.post('/plans', plansController.create);
  router.patch('/plans/:id', plansController.updateDetails);
  router.post('/plans/:id/price', plansController.updatePrice);
  router.post('/plans/:id/status', plansController.toggleStatus);

  return router;
};
