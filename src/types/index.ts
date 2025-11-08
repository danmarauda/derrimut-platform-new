/**
 * Central type definitions for Derrimut Platform
 * Barrel export file for all type modules
 */

// Stripe types
export * from './stripe';

// Salary types
export * from './salary';

// Membership types
export * from './membership';

// Fitness types
export * from './fitness';

// Organization types
export * from './organization';

// Common utility types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export type DateRange = {
  start: Date;
  end: Date;
};

export type FilterOptions = {
  search?: string;
  status?: string;
  role?: string;
  dateRange?: DateRange;
};
