/**
 * Rate Limiting Middleware
 *
 * Implements rate limiting for API routes to prevent abuse and DoS attacks.
 *
 * Task: 2.2 - Rate Limiting Implementation
 */

import rateLimit from 'express-rate-limit';

/**
 * Standard rate limiter for general API routes
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please slow down.',
      retryAfter: Math.ceil((req.rateLimit?.resetTime?.getTime() || Date.now()) / 1000),
    });
  },
});

/**
 * Strict rate limiter for sensitive routes (auth, payments, etc.)
 * 10 requests per 15 minutes per IP
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // stricter limit for sensitive operations
  message: {
    success: false,
    error: 'Too many attempts, please try again later.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many attempts. For security, please wait before trying again.',
      retryAfter: Math.ceil((req.rateLimit?.resetTime?.getTime() || Date.now()) / 1000),
    });
  },
});

/**
 * Aggressive rate limiter for very sensitive routes (password reset, etc.)
 * 5 requests per hour per IP
 */
export const aggressiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // very strict limit
  message: {
    success: false,
    error: 'Maximum attempts exceeded. Please try again later.',
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many attempts. This action has been temporarily blocked.',
      retryAfter: Math.ceil((req.rateLimit?.resetTime?.getTime() || Date.now()) / 1000),
    });
  },
});

/**
 * Custom rate limiter for webhook endpoints
 * 1000 requests per minute (Stripe can send bursts)
 */
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // high limit for legitimate webhook traffic
  message: {
    success: false,
    error: 'Webhook rate limit exceeded.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for requests with valid webhook signatures
    // This is checked later in the webhook handler
    return false;
  },
});

/**
 * Helper to create custom rate limiter
 */
export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      error: options.message || 'Rate limit exceeded.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

/**
 * Next.js API route wrapper with rate limiting
 * 
 * Usage:
 * export default withRateLimit(apiLimiter, async (req, res) => {
 *   // your handler
 * });
 */
export function withRateLimit(
  limiter: any,
  handler: (req: any, res: any) => Promise<any>
) {
  return async (req: any, res: any) => {
    return new Promise((resolve, reject) => {
      limiter(req, res, async (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(await handler(req, res));
      });
    });
  };
}

/**
 * Get client IP address from request
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             req.headers.get('x-real-ip') || 
             'unknown';
  return ip;
}

/**
 * In-memory rate limit store (simple implementation)
 * For production, use Redis or similar
 */
class MemoryStore {
  private hits: Map<string, { count: number; resetTime: number }> = new Map();

  increment(key: string, windowMs: number, max: number): {
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  } {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    const entry = this.hits.get(key);
    
    if (!entry || entry.resetTime < now) {
      // New window
      this.hits.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: max - 1,
        resetTime: new Date(resetTime),
      };
    }
    
    // Increment existing
    entry.count++;
    this.hits.set(key, entry);
    
    return {
      allowed: entry.count <= max,
      remaining: Math.max(0, max - entry.count),
      resetTime: new Date(entry.resetTime),
    };
  }

  // Cleanup old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.hits.entries()) {
      if (value.resetTime < now) {
        this.hits.delete(key);
      }
    }
  }
}

export const memoryStore = new MemoryStore();

// Cleanup every 5 minutes
setInterval(() => memoryStore.cleanup(), 5 * 60 * 1000);
