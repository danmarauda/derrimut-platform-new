/**
 * Test utilities for Convex and React components
 * Provides mock contexts and helper functions for consistent testing
 */

import { vi, expect } from 'vitest';
import type { DataModel } from '../../convex/_generated/dataModel';
// QueryCtx and MutationCtx don't exist in convex/server - use any for test mocks

// Mock Convex context for testing
export function createMockConvexContext() {
  // Create chained query mock methods
  const createQueryChain = () => ({
    withIndex: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    collect: vi.fn(),
    first: vi.fn(),
    unique: vi.fn(),
  });

  return {
    db: {
      get: vi.fn(),
      query: vi.fn(() => createQueryChain()),
      insert: vi.fn(),
      patch: vi.fn(),
      replace: vi.fn(),
      delete: vi.fn(),
    },
    auth: {
      getUserIdentity: vi.fn(),
    },
    scheduler: {
      runAfter: vi.fn(),
      runAfterJob: vi.fn(),
      cancelAllScheduledJobs: vi.fn(),
    },
    storage: {
      generateUploadUrl: vi.fn(),
      getUrl: vi.fn(),
      delete: vi.fn(),
    },
    vectorSearch: vi.fn(),
    runQuery: vi.fn(),
    runMutation: vi.fn(),
    runAction: vi.fn(),
  } as any; // Use any since QueryCtx/MutationCtx don't exist
}

// Mock user data for testing
export function createMockUser(overrides: Partial<DataModel['users']> = {}) {
  return {
    _id: 'test_user_id',
    _creationTime: Date.now(),
    clerkId: 'user_123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    membershipStatus: 'active',
    membershipType: null,
    membershipExpiry: null,
    emergencyContact: null,
    emergencyPhone: null,
    dateOfBirth: null,
    phone: null,
    address: null,
    preferences: {},
    medicalNotes: null,
    fitnessGoals: [],
    joinDate: Date.now(),
    lastVisit: null,
    totalVisits: 0,
    personalTrainer: null,
    ...overrides,
  };
}

// Mock authenticated context with user
export function createMockAuthenticatedContext(role: 'superadmin' | 'admin' | 'trainer' | 'user' = 'user') {
  const ctx = createMockConvexContext();
  const mockUser = {
    ...createMockUser(),
    role,
  };
  
  // Mock auth to return user identity
  (ctx.auth.getUserIdentity as ReturnType<typeof vi.fn>).mockResolvedValue({
    subject: mockUser.clerkId,
    tokenIdentifier: mockUser.clerkId,
  });
  
  // Mock database queries for user
  (ctx.db.query as ReturnType<typeof vi.fn>).mockReturnValue({
    withIndex: vi.fn().mockReturnValue({
      unique: vi.fn().mockResolvedValue(mockUser),
      first: vi.fn().mockResolvedValue(mockUser),
      collect: vi.fn().mockResolvedValue([mockUser]),
    }),
    filter: vi.fn().mockReturnValue({
      first: vi.fn().mockResolvedValue(mockUser),
      collect: vi.fn().mockResolvedValue([mockUser]),
    }),
    collect: vi.fn().mockResolvedValue([mockUser]),
  });
  
  (ctx.db.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
  
  return ctx;
}

// Helper to create mock function arguments
export function createMockArgs<T = any>(args: Partial<T> = {}): T {
  return args as T;
}

// Test helper to verify Convex function calls
export function expectConvexFunctionCall(mockFn: ReturnType<typeof vi.fn>, expectedArgs: any) {
  expect(mockFn).toHaveBeenCalledWith(expectedArgs);
}

// Mock environment variables for testing
export function mockEnvironmentVariables(env: Record<string, string>) {
  Object.entries(env).forEach(([key, value]) => {
    vi.stubEnv(key, value);
  });
}

// Clean up mock environment variables
export function cleanupMockEnvironment() {
  vi.unstubAllEnvs();
}

// Helper to create mock Stripe session
export function createMockStripeSession(overrides: Partial<any> = {}) {
  return {
    id: 'cs_test_123',
    url: 'https://checkout.stripe.com/session/cs_test_123',
    payment_status: 'unpaid',
    metadata: {
      clerkId: 'user_123',
      membershipType: 'standard',
    },
    ...overrides,
  };
}

// Helper to create mock NextRequest
export function createMockRequest(body: any, headers: Record<string, string> = {}) {
  return {
    json: vi.fn().mockResolvedValue(body),
    headers: new Headers({
      host: 'localhost:3000',
      ...headers,
    }),
  };
}

// Helper to wait for async operations
export function waitFor(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}