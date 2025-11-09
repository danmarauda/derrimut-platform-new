/**
 * Environment Variable Validation
 *
 * This module validates all environment variables on application startup
 * using Zod schemas to ensure type safety and prevent runtime errors.
 *
 * @module env
 */

import { z } from 'zod';

/**
 * Server-side environment variables schema
 * These are only available on the server and should never be exposed to the client
 */
const serverSchema = z.object({
  // Convex
  CONVEX_DEPLOYMENT: z.string().min(1, 'CONVEX_DEPLOYMENT is required'),

  // Stripe (Server)
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_'),

  // Clerk (Server)
  CLERK_SECRET_KEY: z.string().startsWith('sk_', 'CLERK_SECRET_KEY must start with sk_'),
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  // Gemini AI
  GEMINI_API_KEY: z.string().optional(),

  // Vercel AI Gateway (optional - enables rate limiting, cost tracking, monitoring)
  AI_GATEWAY_API_KEY: z.string().optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Client-side environment variables schema
 * These are exposed to the browser and must be prefixed with NEXT_PUBLIC_
 */
const clientSchema = z.object({
  // Convex (Client)
  NEXT_PUBLIC_CONVEX_URL: z.string().url('NEXT_PUBLIC_CONVEX_URL must be a valid URL'),

  // Stripe (Client)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_'),

  // Clerk (Client)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with pk_'),

  // Vapi Voice AI
  NEXT_PUBLIC_VAPI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_VAPI_WORKFLOW_ID: z.string().optional(),
});

/**
 * Validates server-side environment variables
 * @throws {Error} If validation fails with detailed error messages
 */
function validateServerEnv() {
  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid server environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid server environment variables. Check the errors above.');
  }

  return parsed.data;
}

/**
 * Validates client-side environment variables
 * @throws {Error} If validation fails with detailed error messages
 */
function validateClientEnv() {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_VAPI_API_KEY: process.env.NEXT_PUBLIC_VAPI_API_KEY,
    NEXT_PUBLIC_VAPI_WORKFLOW_ID: process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID,
  });

  if (!parsed.success) {
    console.error('❌ Invalid client environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid client environment variables. Check the errors above.');
  }

  return parsed.data;
}

/**
 * Type-safe server environment variables
 * Only use this on the server side (API routes, server components, etc.)
 */
export const serverEnv = typeof window === 'undefined' ? validateServerEnv() : ({} as z.infer<typeof serverSchema>);

/**
 * Type-safe client environment variables
 * Safe to use on both client and server
 */
export const clientEnv = validateClientEnv();

/**
 * Combined environment for convenience
 * Use with caution - ensure you're not exposing server secrets to the client
 */
export const env = {
  ...clientEnv,
  ...(typeof window === 'undefined' ? serverEnv : {}),
};

// Log validation success (only in development)
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  console.log('✅ Environment variables validated successfully');
}
