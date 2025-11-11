import { InMemoryPlanRepository } from '../src/infrastructure/adapters/persistence/in-memory/InMemoryPlanRepository';
import { InMemorySubscriptionRepository } from '../src/infrastructure/adapters/persistence/in-memory/InMemorySubscriptionRepository';
import { InMemoryUserRepository } from '../src/infrastructure/adapters/persistence/in-memory/InMemoryUserRepository';
import { InMemoryEventPublisher } from '../src/infrastructure/adapters/gateways/InMemoryEventPublisher';
import { InMemoryPaymentGateway } from '../src/infrastructure/adapters/gateways/InMemoryPaymentGateway';
import { TypeOrmPlanRepository } from '../src/infrastructure/adapters/persistence/typeorm/TypeOrmPlanRepository';
import { TypeOrmSubscriptionRepository } from '../src/infrastructure/adapters/persistence/typeorm/TypeOrmSubscriptionRepository';
import { TypeOrmUserRepository } from '../src/infrastructure/adapters/persistence/typeorm/TypeOrmUserRepository';
import { CreatePlanUseCase } from '../src/application/use-cases/plans/CreatePlanUseCase';
import { TogglePlanStatusUseCase } from '../src/application/use-cases/plans/TogglePlanStatusUseCase';
import { UpdatePlanDetailsUseCase } from '../src/application/use-cases/plans/UpdatePlanDetailsUseCase';
import { UpdatePlanPriceUseCase } from '../src/application/use-cases/plans/UpdatePlanPriceUseCase';
import { CancelSubscriptionUseCase } from '../src/application/use-cases/subscriptions/CancelSubscriptionUseCase';
import { CreateSubscriptionUseCase } from '../src/application/use-cases/subscriptions/CreateSubscriptionUseCase';
import { PauseSubscriptionUseCase } from '../src/application/use-cases/subscriptions/PauseSubscriptionUseCase';
import { RenewSubscriptionUseCase } from '../src/application/use-cases/subscriptions/RenewSubscriptionUseCase';
import { ResumeSubscriptionUseCase } from '../src/application/use-cases/subscriptions/ResumeSubscriptionUseCase';
import { CreateUserUseCase } from '../src/application/use-cases/users/CreateUserUseCase';
import { ToggleUserStatusUseCase } from '../src/application/use-cases/users/ToggleUserStatusUseCase';
import { UpdateUserProfileUseCase } from '../src/application/use-cases/users/UpdateUserProfileUseCase';
import type { PlanRepository } from '../src/application/ports/plan.repository';
import type { SubscriptionRepository } from '../src/application/ports/subscription.repository';
import type { UserRepository } from '../src/application/ports/user.repository';
import { UuidIdGenerator } from '../src/infrastructure/id/UuidIdGenerator';
import { AppDataSource } from '../src/infrastructure/database/data-source';
import type { DataSource } from 'typeorm';

export interface UseCaseRegistry {
  createSubscription: CreateSubscriptionUseCase;
  renewSubscription: RenewSubscriptionUseCase;
  cancelSubscription: CancelSubscriptionUseCase;
  pauseSubscription: PauseSubscriptionUseCase;
  resumeSubscription: ResumeSubscriptionUseCase;
  createUser: CreateUserUseCase;
  updateUserProfile: UpdateUserProfileUseCase;
  toggleUserStatus: ToggleUserStatusUseCase;
  createPlan: CreatePlanUseCase;
  updatePlanDetails: UpdatePlanDetailsUseCase;
  updatePlanPrice: UpdatePlanPriceUseCase;
  togglePlanStatus: TogglePlanStatusUseCase;
}

export interface Composition {
  useCases: UseCaseRegistry;
  infrastructure: {
    planRepository: PlanRepository;
    userRepository: UserRepository;
    subscriptionRepository: SubscriptionRepository;
    paymentGateway: InMemoryPaymentGateway;
    eventPublisher: InMemoryEventPublisher;
    idGenerator: UuidIdGenerator;
    dataSource?: DataSource;
  };
}

type RepositoryBundle = {
  planRepository: PlanRepository;
  userRepository: UserRepository;
  subscriptionRepository: SubscriptionRepository;
  dataSource?: DataSource;
};

export const createComposition = async (): Promise<Composition> => {
  const persistence = process.env.PERSISTENCE ?? 'memory';

  const repositories =
    persistence === 'typeorm'
      ? await createTypeOrmRepositories()
      : createInMemoryRepositories();

  return buildComposition(repositories);
};

const buildComposition = (repositories: RepositoryBundle): Composition => {
  const paymentGateway = new InMemoryPaymentGateway();
  const eventPublisher = new InMemoryEventPublisher();
  const idGenerator = new UuidIdGenerator();

  const useCases: UseCaseRegistry = {
    createSubscription: new CreateSubscriptionUseCase(
      repositories.subscriptionRepository,
      repositories.planRepository,
      repositories.userRepository,
      paymentGateway,
      eventPublisher,
      idGenerator
    ),
    renewSubscription: new RenewSubscriptionUseCase(
      repositories.subscriptionRepository,
      paymentGateway,
      eventPublisher,
      idGenerator
    ),
    cancelSubscription: new CancelSubscriptionUseCase(
      repositories.subscriptionRepository,
      eventPublisher
    ),
    pauseSubscription: new PauseSubscriptionUseCase(
      repositories.subscriptionRepository
    ),
    resumeSubscription: new ResumeSubscriptionUseCase(
      repositories.subscriptionRepository,
      eventPublisher
    ),
    createUser: new CreateUserUseCase(repositories.userRepository, idGenerator),
    updateUserProfile: new UpdateUserProfileUseCase(repositories.userRepository),
    toggleUserStatus: new ToggleUserStatusUseCase(repositories.userRepository),
    createPlan: new CreatePlanUseCase(repositories.planRepository, idGenerator),
    updatePlanDetails: new UpdatePlanDetailsUseCase(repositories.planRepository),
    updatePlanPrice: new UpdatePlanPriceUseCase(repositories.planRepository),
    togglePlanStatus: new TogglePlanStatusUseCase(repositories.planRepository)
  };

  return {
    useCases,
    infrastructure: {
      ...repositories,
      paymentGateway,
      eventPublisher,
      idGenerator
    }
  };
};

const createInMemoryRepositories = (): RepositoryBundle => ({
  planRepository: new InMemoryPlanRepository(),
  userRepository: new InMemoryUserRepository(),
  subscriptionRepository: new InMemorySubscriptionRepository()
});

const createTypeOrmRepositories = async (): Promise<RepositoryBundle> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  return {
    planRepository: new TypeOrmPlanRepository(AppDataSource),
    userRepository: new TypeOrmUserRepository(AppDataSource),
    subscriptionRepository: new TypeOrmSubscriptionRepository(AppDataSource),
    dataSource: AppDataSource
  };
};
