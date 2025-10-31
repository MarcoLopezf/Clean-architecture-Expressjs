import { CreateSubscriptionUseCase } from '../../../application/use-cases/subscriptions/CreateSubscriptionUseCase';
import { RenewSubscriptionUseCase } from '../../../application/use-cases/subscriptions/RenewSubscriptionUseCase';
import { CancelSubscriptionUseCase } from '../../../application/use-cases/subscriptions/CancelSubscriptionUseCase';
import { PauseSubscriptionUseCase } from '../../../application/use-cases/subscriptions/PauseSubscriptionUseCase';
import { ResumeSubscriptionUseCase } from '../../../application/use-cases/subscriptions/ResumeSubscriptionUseCase';
import { CreateUserUseCase } from '../../../application/use-cases/users/CreateUserUseCase';
import { UpdateUserProfileUseCase } from '../../../application/use-cases/users/UpdateUserProfileUseCase';
import { ToggleUserStatusUseCase } from '../../../application/use-cases/users/ToggleUserStatusUseCase';
import { CreatePlanUseCase } from '../../../application/use-cases/plans/CreatePlanUseCase';
import { UpdatePlanDetailsUseCase } from '../../../application/use-cases/plans/UpdatePlanDetailsUseCase';
import { UpdatePlanPriceUseCase } from '../../../application/use-cases/plans/UpdatePlanPriceUseCase';
import { TogglePlanStatusUseCase } from '../../../application/use-cases/plans/TogglePlanStatusUseCase';

export interface HttpUseCaseRegistry {
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
