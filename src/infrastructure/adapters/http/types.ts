import { CreateSubscriptionUseCase } from '../../../application/use-cases/subscriptions/CreateSubscriptionUseCase';
import { RenewSubscriptionUseCase } from '../../../application/use-cases/subscriptions/RenewSubscriptionUseCase';
import { CancelSubscriptionUseCase } from '../../../application/use-cases/subscriptions/CancelSubscriptionUseCase';
import { PauseSubscriptionUseCase } from '../../../application/use-cases/subscriptions/PauseSubscriptionUseCase';
import { ResumeSubscriptionUseCase } from '../../../application/use-cases/subscriptions/ResumeSubscriptionUseCase';
import { CreateUserUseCase } from '../../../application/use-cases/users/CreateUserUseCase';
import { UpdateUserProfileUseCase } from '../../../application/use-cases/users/UpdateUserProfileUseCase';
import { ToggleUserStatusUseCase } from '../../../application/use-cases/users/ToggleUserStatusUseCase';
import { ListUsersUseCase } from '../../../application/use-cases/users/ListUsersUseCase';
import { GetUserByIdUseCase } from '../../../application/use-cases/users/GetUserByIdUseCase';
import { CreatePlanUseCase } from '../../../application/use-cases/plans/CreatePlanUseCase';
import { UpdatePlanDetailsUseCase } from '../../../application/use-cases/plans/UpdatePlanDetailsUseCase';
import { UpdatePlanPriceUseCase } from '../../../application/use-cases/plans/UpdatePlanPriceUseCase';
import { TogglePlanStatusUseCase } from '../../../application/use-cases/plans/TogglePlanStatusUseCase';
import { ListPlansUseCase } from '../../../application/use-cases/plans/ListPlansUseCase';
import { GetPlanByIdUseCase } from '../../../application/use-cases/plans/GetPlanByIdUseCase';
import { ListSubscriptionsUseCase } from '../../../application/use-cases/subscriptions/ListSubscriptionsUseCase';
import { GetSubscriptionByIdUseCase } from '../../../application/use-cases/subscriptions/GetSubscriptionByIdUseCase';

export interface HttpUseCaseRegistry {
  createSubscription: CreateSubscriptionUseCase;
  renewSubscription: RenewSubscriptionUseCase;
  cancelSubscription: CancelSubscriptionUseCase;
  pauseSubscription: PauseSubscriptionUseCase;
  resumeSubscription: ResumeSubscriptionUseCase;
  listSubscriptions: ListSubscriptionsUseCase;
  getSubscriptionById: GetSubscriptionByIdUseCase;
  createUser: CreateUserUseCase;
  updateUserProfile: UpdateUserProfileUseCase;
  toggleUserStatus: ToggleUserStatusUseCase;
  listUsers: ListUsersUseCase;
  getUserById: GetUserByIdUseCase;
  createPlan: CreatePlanUseCase;
  updatePlanDetails: UpdatePlanDetailsUseCase;
  updatePlanPrice: UpdatePlanPriceUseCase;
  togglePlanStatus: TogglePlanStatusUseCase;
  listPlans: ListPlansUseCase;
  getPlanById: GetPlanByIdUseCase;
}
