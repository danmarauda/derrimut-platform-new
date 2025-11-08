/**
 * Stripe-related type definitions
 * Extends Stripe SDK types with application-specific types
 */

import type { Stripe } from 'stripe';

export type StripeSession = Stripe.Checkout.Session;
export type StripeSubscription = Stripe.Subscription;
export type StripeInvoice = Stripe.Invoice;
export type StripeCustomer = Stripe.Customer;
export type StripePrice = Stripe.Price;
export type StripeProduct = Stripe.Product;

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

export interface StripeCheckoutMetadata {
  clerkId?: string;
  userId?: string;
  trainerId?: string;
  membershipType?: string;
  type?: 'marketplace_order' | 'booking' | 'subscription';
  sessionType?: string;
  sessionDate?: string;
  startTime?: string;
  duration?: string;
  notes?: string;
  shippingAddress?: string;
}

export interface MarketplaceSessionMetadata extends StripeCheckoutMetadata {
  type: 'marketplace_order';
  clerkId: string;
  shippingAddress: string;
}

export interface BookingSessionMetadata extends StripeCheckoutMetadata {
  type: 'booking';
  userId: string;
  trainerId: string;
  sessionType: string;
  sessionDate: string;
  startTime: string;
  duration: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}
