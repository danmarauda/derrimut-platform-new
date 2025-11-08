/**
 * Booking Validation Schemas
 *
 * Zod schemas for validating trainer booking data.
 *
 * Task: 2.1 - Input Validation
 */

import { z } from 'zod';

// Session type enum
export const sessionTypeSchema = z.enum([
  'Personal Training',
  'Group Class',
  'Nutrition Consultation',
  'Fitness Assessment'
], {
  errorMap: () => ({ message: 'Invalid session type' })
});

// Booking status enum
export const bookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no-show'
], {
  errorMap: () => ({ message: 'Invalid booking status' })
});

// Payment status enum
export const paymentStatusSchema = z.enum([
  'pending',
  'paid',
  'failed',
  'refunded'
], {
  errorMap: () => ({ message: 'Invalid payment status' })
});

// Create booking schema (for checkout session)
export const createBookingSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  trainerId: z.string().min(1, 'Trainer ID is required'),
  sessionType: sessionTypeSchema,
  sessionDate: z.string().datetime('Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  duration: z.number().int().min(30, 'Duration must be at least 30 minutes').max(240, 'Duration cannot exceed 240 minutes'),
  notes: z.string().max(500, 'Notes too long').optional(),
});

// Create paid booking schema (from webhook)
export const createPaidBookingSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  trainerId: z.string().min(1, 'Trainer ID is required'),
  userClerkId: z.string().min(1, 'User Clerk ID is required'),
  sessionType: sessionTypeSchema,
  sessionDate: z.string().datetime('Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  duration: z.number().int().min(30).max(240),
  totalAmount: z.number().positive('Amount must be positive'),
  paymentSessionId: z.string().startsWith('cs_', 'Invalid Stripe session ID'),
  notes: z.string().max(500).optional(),
});

// Update booking schema
export const updateBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  status: bookingStatusSchema.optional(),
  sessionDate: z.string().datetime().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  duration: z.number().int().min(30).max(240).optional(),
  notes: z.string().max(500).optional(),
});

// Cancel booking schema
export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  cancellationReason: z.string().max(500, 'Reason too long').optional(),
});

// Booking session checkout metadata
export const bookingCheckoutMetadataSchema = z.object({
  userId: z.string().min(1),
  trainerId: z.string().min(1),
  sessionType: sessionTypeSchema,
  sessionDate: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.string().regex(/^\d+$/, 'Duration must be a number'),
  notes: z.string().max(500).optional(),
  type: z.literal('booking'),
});

// Type exports
export type SessionType = z.infer<typeof sessionTypeSchema>;
export type BookingStatus = z.infer<typeof bookingStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreatePaidBookingInput = z.infer<typeof createPaidBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type BookingCheckoutMetadata = z.infer<typeof bookingCheckoutMetadataSchema>;
