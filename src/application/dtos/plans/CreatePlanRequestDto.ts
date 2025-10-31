import type { BillingCycleUnit } from '../../../domain/shared/BillingCycle';

export interface CreatePlanRequestDto {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  billingCycleUnit: BillingCycleUnit;
  billingCycleInterval?: number;
}
