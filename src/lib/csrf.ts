/**
 * CSRF Protection
 *
 * Implements Cross-Site Request Forgery protection for API routes and forms.
 *
 * Task: 2.3 - CSRF Protection
 */

import Tokens from 'csrf';
import { cookies } from 'next/headers';

const tokens = new Tokens();

// Secret for CSRF tokens (should be in env, using constant for simplicity)
const CSRF_SECRET = process.env.CSRF_SECRET || 'derrimut-csrf-secret-change-in-production';
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a new CSRF token
 */
export async function generateCSRFToken(): Promise<string> {
  const token = tokens.create(CSRF_SECRET);
  
  // Store token in cookie
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
  
  return token;
}

/**
 * Verify CSRF token from request
 */
export async function verifyCSRFToken(token: string): Promise<boolean> {
  if (!token) {
    return false;
  }
  
  try {
    return tokens.verify(CSRF_SECRET, token);
  } catch (error) {
    console.error('CSRF token verification error:', error);
    return false;
  }
}

/**
 * Get CSRF token from request headers or body
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  // Check header first
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) {
    return headerToken;
  }
  
  // Could also check body if needed (for form submissions)
  return null;
}

/**
 * Get CSRF token from cookies
 */
export async function getCSRFTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CSRF_COOKIE_NAME);
    return token?.value || null;
  } catch (error) {
    console.error('Error reading CSRF cookie:', error);
    return null;
  }
}

/**
 * Middleware to validate CSRF token for API routes
 */
export async function validateCSRF(request: Request): Promise<{
  valid: boolean;
  error?: string;
}> {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return { valid: true };
  }
  
  // Get token from request
  const requestToken = getCSRFTokenFromRequest(request);
  if (!requestToken) {
    return {
      valid: false,
      error: 'CSRF token missing from request',
    };
  }
  
  // Get token from cookies
  const cookieToken = await getCSRFTokenFromCookies();
  if (!cookieToken) {
    return {
      valid: false,
      error: 'CSRF token missing from cookies',
    };
  }
  
  // Verify token matches
  if (requestToken !== cookieToken) {
    return {
      valid: false,
      error: 'CSRF token mismatch',
    };
  }
  
  // Verify token is valid
  const isValid = await verifyCSRFToken(requestToken);
  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid CSRF token',
    };
  }
  
  return { valid: true };
}

/**
 * Create CSRF error response
 */
export function createCSRFErrorResponse(error: string = 'CSRF validation failed') {
  return new Response(
    JSON.stringify({
      success: false,
      error,
      code: 'CSRF_ERROR',
    }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Wrapper for API routes with CSRF protection
 * 
 * Usage:
 * export const POST = withCSRFProtection(async (request) => {
 *   // Your handler - CSRF already validated
 * });
 */
export function withCSRFProtection(
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    // Validate CSRF
    const validation = await validateCSRF(request);
    
    if (!validation.valid) {
      console.warn('CSRF validation failed:', validation.error);
      return createCSRFErrorResponse(validation.error);
    }
    
    // CSRF valid, proceed to handler
    return handler(request);
  };
}

/**
 * Helper for forms - get CSRF token for inclusion in forms
 */
export async function getCSRFTokenForForm(): Promise<string> {
  // Check if we already have a token
  const existingToken = await getCSRFTokenFromCookies();
  
  if (existingToken) {
    // Verify it's still valid
    const isValid = await verifyCSRFToken(existingToken);
    if (isValid) {
      return existingToken;
    }
  }
  
  // Generate new token
  return generateCSRFToken();
}

/**
 * React component helper to include in forms
 * 
 * Usage in server component:
 * const csrfToken = await getCSRFTokenForForm();
 * <input type="hidden" name="csrf_token" value={csrfToken} />
 * 
 * For client components, you'd fetch from an API endpoint that returns the token
 */
export const CSRF_FIELD_NAME = 'csrf_token';
