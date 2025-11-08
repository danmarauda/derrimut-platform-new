/**
 * Validation Utilities
 *
 * Helper functions for validation across the application.
 *
 * Task: 2.1 - Input Validation
 */

import { z, ZodError } from 'zod';

/**
 * Formats Zod validation errors into user-friendly messages
 */
export function formatZodError(error: ZodError): string[] {
  return error.errors.map((err) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
}

/**
 * Validates data against a Zod schema and returns formatted errors
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, errors: formatZodError(error) };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

/**
 * Safe parse that returns null on error instead of throwing
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validates JSON string and parses it
 */
export function validateJSON<T>(
  schema: z.ZodSchema<T>,
  jsonString: string
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const parsed = JSON.parse(jsonString);
    return validateWithSchema(schema, parsed);
  } catch (error) {
    return { success: false, errors: ['Invalid JSON format'] };
  }
}

/**
 * Creates a standardized API error response
 */
export function createValidationErrorResponse(errors: string[], status = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      errors,
      message: 'Validation failed',
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Creates a standardized API success response
 */
export function createSuccessResponse<T>(data: T, status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      data,
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Australian phone number validator
 */
export const australianPhoneSchema = z.string().regex(
  /^(\+61|0)[2-478]( ?\d){8}$/,
  'Invalid Australian phone number format'
);

/**
 * Australian postcode validator
 */
export const australianPostcodeSchema = z.string().regex(
  /^\d{4}$/,
  'Postcode must be 4 digits'
);

/**
 * Email validator with additional checks
 */
export const strictEmailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email too long')
  .transform((email) => email.toLowerCase().trim());

/**
 * URL validator for images
 */
export const imageUrlSchema = z.string().url('Invalid URL').refine(
  (url) => {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return validExtensions.some((ext) => url.toLowerCase().includes(ext)) ||
           url.includes('clerk.com') ||
           url.includes('cloudinary.com') ||
           url.includes('images.unsplash.com');
  },
  { message: 'URL must be an image' }
);

/**
 * Stripe ID validators
 */
export const stripeCustomerIdSchema = z.string().startsWith('cus_', 'Invalid Stripe customer ID');
export const stripeSubscriptionIdSchema = z.string().startsWith('sub_', 'Invalid Stripe subscription ID');
export const stripePriceIdSchema = z.string().startsWith('price_', 'Invalid Stripe price ID');
export const stripeProductIdSchema = z.string().startsWith('prod_', 'Invalid Stripe product ID');
export const stripeSessionIdSchema = z.string().startsWith('cs_', 'Invalid Stripe session ID');
export const stripePaymentIntentIdSchema = z.string().startsWith('pi_', 'Invalid Stripe payment intent ID');

/**
 * UUID validator
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Positive integer validator
 */
export const positiveIntSchema = z.number().int('Must be an integer').positive('Must be positive');

/**
 * Date string validator (ISO 8601)
 */
export const dateStringSchema = z.string().datetime('Invalid date format');

/**
 * Time string validator (HH:MM)
 */
export const timeStringSchema = z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format');

/**
 * Validates that a date is in the future
 */
export const futureDateSchema = z.string().datetime().refine(
  (date) => new Date(date) > new Date(),
  { message: 'Date must be in the future' }
);

/**
 * Validates that a date is in the past
 */
export const pastDateSchema = z.string().datetime().refine(
  (date) => new Date(date) < new Date(),
  { message: 'Date must be in the past' }
);
