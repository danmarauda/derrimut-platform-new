/**
 * Membership Validation Schemas
 *
 * Zod schemas for validating membership-related data across the application.
 * Used in API routes, Convex functions, and form submissions.
 *
 * Task: 2.1 - Input Validation
 */

import { z } from 'zod';

// Membership type enum
export const membershipTypeSchema = z.enum([
  '18-month-minimum',
  '12-month-minimum',
  'no-lock-in',
  '12-month-upfront'
], {
  errorMap: () => ({ message: 'Invalid membership type' })
});

// Membership status enum
export const membershipStatusSchema = z.enum([
  'active',
  'pending',
  'cancelled',
  'suspended'
], {
  errorMap: () => ({ message: 'Invalid membership status' })
});

// Create membership schema
export const createMembershipSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  clerkId: z.string().min(1, 'Clerk ID is required'),
  membershipType: membershipTypeSchema,
  stripeCustomerId: z.string().startsWith('cus_', 'Invalid Stripe customer ID'),
  stripeSubscriptionId: z.string().startsWith('sub_', 'Invalid Stripe subscription ID'),
  stripePriceId: z.string().startsWith('price_', 'Invalid Stripe price ID'),
  currentPeriodStart: z.number().positive('Invalid period start timestamp'),
  currentPeriodEnd: z.number().positive('Invalid period end timestamp'),
});

// Update membership schema
export const updateMembershipSchema = z.object({
  membershipId: z.string().optional(),
  stripeSubscriptionId: z.string().startsWith('sub_', 'Invalid Stripe subscription ID').optional(),
  status: membershipStatusSchema.optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  currentPeriodStart: z.number().positive('Invalid period start timestamp').optional(),
  currentPeriodEnd: z.number().positive('Invalid period end timestamp').optional(),
}).refine(
  (data) => data.membershipId || data.stripeSubscriptionId,
  {
    message: 'Either membershipId or stripeSubscriptionId must be provided',
  }
);

// Cancel membership schema
export const cancelMembershipSchema = z.object({
  membershipId: z.string().min(1, 'Membership ID is required'),
  cancelAtPeriodEnd: z.boolean().default(true),
  cancellationReason: z.string().max(500, 'Reason too long').optional(),
});

// Resume membership schema
export const resumeMembershipSchema = z.object({
  membershipId: z.string().min(1, 'Membership ID is required'),
});

// Stripe checkout metadata schema
export const stripeCheckoutMetadataSchema = z.object({
  clerkId: z.string().min(1, 'Clerk ID is required'),
  membershipType: membershipTypeSchema,
});

// Type exports
export type MembershipType = z.infer<typeof membershipTypeSchema>;
export type MembershipStatus = z.infer<typeof membershipStatusSchema>;
export type CreateMembershipInput = z.infer<typeof createMembershipSchema>;
export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>;
export type CancelMembershipInput = z.infer<typeof cancelMembershipSchema>;
export type ResumeMembershipInput = z.infer<typeof resumeMembershipSchema>;
export type StripeCheckoutMetadata = z.infer<typeof stripeCheckoutMetadataSchema>;
