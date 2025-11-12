import express, { Router } from 'express';
import { SubscriptionsController } from './controllers/SubscriptionsController';
import { UsersController } from './controllers/UsersController';
import { PlansController } from './controllers/PlansController';
import { AdminController } from './controllers/AdminController';
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
    useCases.listSubscriptions,
    useCases.getSubscriptionById,
    logger.child({ controller: 'SubscriptionsController' })
  );

  const usersController = new UsersController(
    useCases.createUser,
    useCases.updateUserProfile,
    useCases.toggleUserStatus,
    useCases.listUsers,
    useCases.getUserById,
    logger.child({ controller: 'UsersController' })
  );

  const plansController = new PlansController(
    useCases.createPlan,
    useCases.updatePlanDetails,
    useCases.updatePlanPrice,
    useCases.togglePlanStatus,
    useCases.listPlans,
    useCases.getPlanById,
    logger.child({ controller: 'PlansController' })
  );

  const adminController = new AdminController(
    useCases.changeUserRole,
    logger.child({ controller: 'AdminController' })
  );

  router.get('/subscriptions', subscriptionsController.list);
  router.get('/subscriptions/:id', subscriptionsController.getById);
  router.post('/subscriptions', subscriptionsController.create);
  router.patch('/subscriptions/:id/renew', subscriptionsController.renew);
  router.delete('/subscriptions/:id', subscriptionsController.cancel);
  router.patch('/subscriptions/:id/pause', subscriptionsController.pause);
  router.patch('/subscriptions/:id/resume', subscriptionsController.resume);

  router.get('/users', usersController.list);
  router.get('/users/:id', usersController.getById);
  router.post('/users', usersController.create);
  router.patch('/users/:id', usersController.updateProfile);
  router.post('/users/:id/status', usersController.toggleStatus);

  router.get('/plans', plansController.list);
  router.get('/plans/:id', plansController.getById);
  router.post('/plans', plansController.create);
  router.patch('/plans/:id', plansController.updateDetails);
  router.patch('/plans/:id/price', plansController.updatePrice);
  router.patch('/plans/:id/status', plansController.toggleStatus);
  router.post('/admin/bootstrap', adminController.bootstrapAdmin);
  router.patch('/admin/users/:id/role', adminController.changeRole);

  return router;
};
