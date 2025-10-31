import { InMemoryPlanRepository } from '../src/infrastructure/persistence/in-memory/InMemoryPlanRepository';
import { InMemoryUserRepository } from '../src/infrastructure/persistence/in-memory/InMemoryUserRepository';
import { InMemorySubscriptionRepository } from '../src/infrastructure/persistence/in-memory/InMemorySubscriptionRepository';
import { InMemoryPaymentGateway } from '../src/infrastructure/payments/InMemoryPaymentGateway';
import { InMemoryEventPublisher } from '../src/infrastructure/events/InMemoryEventPublisher';
import { UuidIdGenerator } from '../src/infrastructure/id/UuidIdGenerator';

import { CreateSubscriptionUseCase } from '../src/application/use-cases/subscriptions/CreateSubscriptionUseCase';
import { RenewSubscriptionUseCase } from '../src/application/use-cases/subscriptions/RenewSubscriptionUseCase';
import { CancelSubscriptionUseCase } from '../src/application/use-cases/subscriptions/CancelSubscriptionUseCase';
import { PauseSubscriptionUseCase } from '../src/application/use-cases/subscriptions/PauseSubscriptionUseCase';
import { ResumeSubscriptionUseCase } from '../src/application/use-cases/subscriptions/ResumeSubscriptionUseCase';

import { CreateUserUseCase } from '../src/application/use-cases/users/CreateUserUseCase';
import { UpdateUserProfileUseCase } from '../src/application/use-cases/users/UpdateUserProfileUseCase';
import { ToggleUserStatusUseCase } from '../src/application/use-cases/users/ToggleUserStatusUseCase';

import { CreatePlanUseCase } from '../src/application/use-cases/plans/CreatePlanUseCase';
import { UpdatePlanDetailsUseCase } from '../src/application/use-cases/plans/UpdatePlanDetailsUseCase';
import { UpdatePlanPriceUseCase } from '../src/application/use-cases/plans/UpdatePlanPriceUseCase';
import { TogglePlanStatusUseCase } from '../src/application/use-cases/plans/TogglePlanStatusUseCase';

const planRepository = new InMemoryPlanRepository();
const userRepository = new InMemoryUserRepository();
const subscriptionRepository = new InMemorySubscriptionRepository();

const paymentGateway = new InMemoryPaymentGateway();
const eventPublisher = new InMemoryEventPublisher();
const idGenerator = new UuidIdGenerator();

export const useCases = {
  createSubscription: new CreateSubscriptionUseCase(
    subscriptionRepository,
    planRepository,
    userRepository,
    paymentGateway,
    eventPublisher,
    idGenerator
  ),
  renewSubscription: new RenewSubscriptionUseCase(
    subscriptionRepository,
    paymentGateway,
    eventPublisher,
    idGenerator
  ),
  cancelSubscription: new CancelSubscriptionUseCase(
    subscriptionRepository,
    eventPublisher
  ),
  pauseSubscription: new PauseSubscriptionUseCase(subscriptionRepository),
  resumeSubscription: new ResumeSubscriptionUseCase(
    subscriptionRepository,
    eventPublisher
  ),
  createUser: new CreateUserUseCase(userRepository, idGenerator),
  updateUserProfile: new UpdateUserProfileUseCase(userRepository),
  toggleUserStatus: new ToggleUserStatusUseCase(userRepository),
  createPlan: new CreatePlanUseCase(planRepository, idGenerator),
  updatePlanDetails: new UpdatePlanDetailsUseCase(planRepository),
  updatePlanPrice: new UpdatePlanPriceUseCase(planRepository),
  togglePlanStatus: new TogglePlanStatusUseCase(planRepository)
};

export const infrastructure = {
  planRepository,
  userRepository,
  subscriptionRepository,
  paymentGateway,
  eventPublisher,
  idGenerator
};
