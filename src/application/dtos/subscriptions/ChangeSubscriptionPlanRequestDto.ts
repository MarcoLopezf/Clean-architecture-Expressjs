export interface ChangeSubscriptionPlanRequestDto {
  subscriptionId: string;
  newPlanId: string;
  effectiveDate?: Date;
}
