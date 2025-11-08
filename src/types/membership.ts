/**
 * Membership-related type definitions
 */

export type MembershipType =
  | '18-month-minimum'
  | '12-month-minimum'
  | 'no-lock-in'
  | '12-month-upfront';

export type MembershipStatus = 'active' | 'cancelled' | 'pending' | 'expired';

export interface Membership {
  _id: string;
  _creationTime: number;
  userId: string;
  clerkId: string;
  membershipType: MembershipType;
  status: MembershipStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  currentPeriodStart?: number;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface MembershipPricing {
  type: MembershipType;
  name: string;
  price: number;
  currency: string;
  stripePriceId: string;
  stripeProductId: string;
  features: string[];
  popular?: boolean;
}
