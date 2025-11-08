/**
 * Custom Error Classes for Derrimut Platform
 *
 * Provides standardized error types for better error handling and tracking
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      context: this.context,
    };
  }
}

/**
 * Authentication errors (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: Record<string, any>) {
    super(message, 401, true, context);
  }
}

/**
 * Authorization errors (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: Record<string, any>) {
    super(message, 403, true, context);
  }
}

/**
 * Resource not found errors (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', context?: Record<string, any>) {
    super(message, 404, true, context);
  }
}

/**
 * Validation errors (400)
 */
export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(
    message: string = 'Validation failed',
    errors: Array<{ field: string; message: string }> = [],
    context?: Record<string, any>
  ) {
    super(message, 400, true, context);
    this.errors = errors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}

/**
 * Conflict errors (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', context?: Record<string, any>) {
    super(message, 409, true, context);
  }
}

/**
 * Rate limit errors (429)
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    context?: Record<string, any>
  ) {
    super(message, 429, true, context);
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * Database errors (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', context?: Record<string, any>) {
    super(message, 500, true, context);
  }
}

/**
 * External service errors (502)
 */
export class ExternalServiceError extends AppError {
  public readonly service: string;

  constructor(
    service: string,
    message: string = 'External service error',
    context?: Record<string, any>
  ) {
    super(message, 502, true, context);
    this.service = service;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      service: this.service,
    };
  }
}

/**
 * Payment errors (402)
 */
export class PaymentError extends AppError {
  public readonly paymentProvider?: string;

  constructor(
    message: string = 'Payment processing failed',
    paymentProvider?: string,
    context?: Record<string, any>
  ) {
    super(message, 402, true, context);
    this.paymentProvider = paymentProvider;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      paymentProvider: this.paymentProvider,
    };
  }
}

/**
 * Configuration errors (500)
 */
export class ConfigurationError extends AppError {
  constructor(message: string = 'Configuration error', context?: Record<string, any>) {
    super(message, 500, false, context);
  }
}

/**
 * Session errors (401)
 */
export class SessionError extends AppError {
  constructor(message: string = 'Session expired or invalid', context?: Record<string, any>) {
    super(message, 401, true, context);
  }
}

/**
 * Timeout errors (504)
 */
export class TimeoutError extends AppError {
  public readonly operation: string;

  constructor(
    operation: string,
    message: string = 'Operation timed out',
    context?: Record<string, any>
  ) {
    super(message, 504, true, context);
    this.operation = operation;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
    };
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if an error is operational
 */
export function isOperationalError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isOperational;
  }
  return false;
}

/**
 * Get error status code
 */
export function getErrorStatusCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode;
  }
  return 500;
}

/**
 * Get error message safely
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
