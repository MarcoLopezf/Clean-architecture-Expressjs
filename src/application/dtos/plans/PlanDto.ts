export interface PlanDto {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  billingCycleUnit: string;
  billingCycleInterval: number;
  isActive: boolean;
}
