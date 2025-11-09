/**
 * Standardized Error Handler Utility
 *
 * Provides consistent error handling, formatting, and reporting across the application
 */

import { NextResponse } from 'next/server';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  PaymentError,
  ConfigurationError,
  SessionError,
  TimeoutError,
  isAppError,
  getErrorStatusCode,
  getErrorMessage,
} from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * Error response interface
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Format error for API response
 */
export function formatErrorResponse(
  error: unknown,
  requestId?: string,
  includeDetails: boolean = process.env.NODE_ENV === 'development'
): ErrorResponse {
  const statusCode = getErrorStatusCode(error);
  const message = getErrorMessage(error);

  const response: ErrorResponse = {
    success: false,
    error: {
      message: getUserFriendlyMessage(error),
      code: isAppError(error) ? error.name : 'INTERNAL_SERVER_ERROR',
      statusCode,
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  // Include additional details in development
  if (includeDetails) {
    response.error.details = {
      originalMessage: message,
      ...(isAppError(error) && error.context ? { context: error.context } : {}),
      ...(error instanceof ValidationError ? { validationErrors: error.errors } : {}),
      ...(error instanceof RateLimitError && error.retryAfter
        ? { retryAfter: error.retryAfter }
        : {}),
      ...(error instanceof ExternalServiceError ? { service: error.service } : {}),
      ...(error instanceof PaymentError && error.paymentProvider
        ? { paymentProvider: error.paymentProvider }
        : {}),
      ...(error instanceof TimeoutError ? { operation: error.operation } : {}),
    };
  }

  return response;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AuthenticationError) {
    return 'Please sign in to continue.';
  }

  if (error instanceof AuthorizationError) {
    return 'You do not have permission to perform this action.';
  }

  if (error instanceof NotFoundError) {
    return 'The requested resource was not found.';
  }

  if (error instanceof ValidationError) {
    return error.errors.length > 0
      ? `Validation failed: ${error.errors.map((e) => e.message).join(', ')}`
      : 'The provided data is invalid.';
  }

  if (error instanceof ConflictError) {
    return 'This resource already exists or conflicts with existing data.';
  }

  if (error instanceof RateLimitError) {
    return error.retryAfter
      ? `Too many requests. Please try again in ${error.retryAfter} seconds.`
      : 'Too many requests. Please try again later.';
  }

  if (error instanceof DatabaseError) {
    return 'A database error occurred. Please try again later.';
  }

  if (error instanceof ExternalServiceError) {
    return `Our ${error.service} service is temporarily unavailable. Please try again later.`;
  }

  if (error instanceof PaymentError) {
    return 'Payment processing failed. Please check your payment details and try again.';
  }

  if (error instanceof ConfigurationError) {
    return 'The application is not properly configured. Please contact support.';
  }

  if (error instanceof SessionError) {
    return 'Your session has expired. Please sign in again.';
  }

  if (error instanceof TimeoutError) {
    return `The ${error.operation} operation timed out. Please try again.`;
  }

  if (isAppError(error)) {
    return error.message;
  }

  // Generic message for unknown errors
  return 'An unexpected error occurred. Please try again later.';
}

/**
 * Handle and log error
 */
export function handleError(error: unknown, context?: Record<string, any>) {
  const statusCode = getErrorStatusCode(error);
  const message = getErrorMessage(error);

  // Determine log level based on error type
  if (statusCode >= 500) {
    logger.error(message, {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack,
      } : undefined,
      ...context,
    });
  } else if (statusCode >= 400) {
    logger.warn(message, {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
      } : undefined,
      ...context,
    });
  } else {
    logger.info(message, context);
  }

  // Report to Sentry for operational errors
  if (isAppError(error) && error.isOperational && typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      contexts: { additional: context },
      level: statusCode >= 500 ? 'error' : 'warning',
      tags: {
        errorType: error.name,
        statusCode: error.statusCode.toString(),
      },
    });
  }
}

/**
 * Create API error response
 */
export function createErrorResponse(
  error: unknown,
  requestId?: string
): NextResponse<ErrorResponse> {
  // Handle and log the error
  handleError(error, { requestId });

  // Format error response
  const errorResponse = formatErrorResponse(error, requestId);

  // Return Next.js response
  return NextResponse.json(errorResponse, {
    status: errorResponse.error.statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...(requestId ? { 'X-Request-ID': requestId } : {}),
    },
  });
}

/**
 * Async error wrapper for API routes
 */
export function asyncHandler<T>(
  handler: (req: Request, context?: any) => Promise<T>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      // Generate request ID
      const requestId = crypto.randomUUID();

      // Return error response
      return createErrorResponse(error, requestId);
    }
  };
}

/**
 * Validate and throw errors
 */
export function validateOrThrow<T>(
  data: T,
  validator: (data: T) => { success: boolean; errors?: Array<{ field: string; message: string }> }
): T {
  const result = validator(data);

  if (!result.success) {
    throw new ValidationError('Validation failed', result.errors || []);
  }

  return data;
}

/**
 * Assert condition or throw error
 */
export function assertOrThrow(
  condition: boolean,
  ErrorClass: typeof AppError,
  message: string,
  context?: Record<string, any>
): asserts condition {
  if (!condition) {
    // AppError constructor: (message, statusCode, isOperational, context)
    // Most error classes override with (message, context) but we need to handle both
    throw new ErrorClass(message, 500, true, context);
  }
}

/**
 * Try-catch wrapper with error transformation
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorTransform?: (error: unknown) => Error
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (errorTransform) {
      throw errorTransform(error);
    }
    throw error;
  }
}

// Export all error classes for convenience
export {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  PaymentError,
  ConfigurationError,
  SessionError,
  TimeoutError,
};
