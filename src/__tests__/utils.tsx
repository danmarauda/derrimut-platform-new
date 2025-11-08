import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ClerkProvider } from '@clerk/nextjs';

/**
 * Mock Convex Client for Testing
 */
export const createMockConvexClient = () => {
  const mockClient = {
    query: jest.fn(),
    mutation: jest.fn(),
    action: jest.fn(),
    setAuth: jest.fn(),
    clearAuth: jest.fn(),
    close: jest.fn(),
  } as unknown as ConvexReactClient;

  return mockClient;
};

/**
 * Mock Clerk User
 */
export const createMockClerkUser = (overrides = {}) => ({
  id: 'user_test123',
  firstName: 'Test',
  lastName: 'User',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  imageUrl: 'https://example.com/avatar.jpg',
  ...overrides,
});

/**
 * Mock Clerk Session
 */
export const createMockClerkSession = () => ({
  id: 'sess_test123',
  status: 'active',
  lastActiveAt: new Date(),
  expireAt: new Date(Date.now() + 86400000),
});

/**
 * Mock useUser hook from Clerk
 */
export const mockUseUser = (user = createMockClerkUser(), isLoaded = true, isSignedIn = true) => {
  return jest.fn(() => ({
    user,
    isLoaded,
    isSignedIn,
  }));
};

/**
 * Mock useQuery hook from Convex
 */
export const mockUseQuery = (returnValue: any) => {
  return jest.fn(() => returnValue);
};

/**
 * Mock useMutation hook from Convex
 */
export const mockUseMutation = () => {
  return jest.fn(() => jest.fn());
};

/**
 * Test Providers Wrapper
 */
interface ProvidersProps {
  children: React.ReactNode;
  convexClient?: ConvexReactClient;
}

export const TestProviders: React.FC<ProvidersProps> = ({
  children,
  convexClient = createMockConvexClient()
}) => {
  return (
    <ClerkProvider publishableKey="pk_test_mock">
      <ConvexProvider client={convexClient}>
        {children}
      </ConvexProvider>
    </ClerkProvider>
  );
};

/**
 * Custom render function with providers
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: TestProviders, ...options });
};

/**
 * Mock Stripe
 */
export const createMockStripe = () => ({
  redirectToCheckout: jest.fn(() => Promise.resolve({ error: null })),
  elements: jest.fn(() => ({
    create: jest.fn(),
    getElement: jest.fn(),
  })),
});

/**
 * Mock Convex Database Context
 */
export const createMockConvexDb = () => ({
  get: jest.fn(),
  query: jest.fn(() => ({
    collect: jest.fn(() => Promise.resolve([])),
    first: jest.fn(() => Promise.resolve(null)),
    unique: jest.fn(() => Promise.resolve(null)),
    filter: jest.fn(() => ({
      collect: jest.fn(() => Promise.resolve([])),
    })),
    order: jest.fn(() => ({
      collect: jest.fn(() => Promise.resolve([])),
    })),
  })),
  insert: jest.fn(() => Promise.resolve('mock_id')),
  patch: jest.fn(() => Promise.resolve()),
  replace: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
});

/**
 * Mock Convex Mutation/Query Context
 */
export const createMockConvexContext = () => ({
  db: createMockConvexDb(),
  auth: {
    getUserIdentity: jest.fn(() => Promise.resolve({
      subject: 'user_test123',
      email: 'test@example.com',
      name: 'Test User',
    })),
  },
  storage: {
    generateUploadUrl: jest.fn(),
    getUrl: jest.fn(),
  },
  scheduler: {
    runAfter: jest.fn(),
    runAt: jest.fn(),
  },
});

/**
 * Wait for async operations
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Mock membership data
 */
export const createMockMembership = (overrides = {}) => ({
  _id: 'membership_test123' as any,
  _creationTime: Date.now(),
  userId: 'user_test123' as any,
  clerkId: 'user_test123',
  membershipType: 'no-lock-in' as const,
  status: 'active' as const,
  stripePriceId: 'price_test123',
  stripeCustomerId: 'cus_test123',
  stripeSubscriptionId: 'sub_test123',
  currentPeriodStart: Date.now(),
  currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
  cancelAtPeriodEnd: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

/**
 * Mock user data
 */
export const createMockUser = (overrides = {}) => ({
  _id: 'user_test123' as any,
  _creationTime: Date.now(),
  name: 'Test User',
  email: 'test@example.com',
  clerkId: 'user_test123',
  role: 'user' as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

/**
 * Mock booking data
 */
export const createMockBooking = (overrides = {}) => ({
  _id: 'booking_test123' as any,
  _creationTime: Date.now(),
  userId: 'user_test123' as any,
  trainerId: 'trainer_test123' as any,
  userClerkId: 'user_test123',
  trainerClerkId: 'trainer_test123',
  sessionType: 'personal_training' as const,
  sessionDate: '2025-08-20',
  startTime: '14:00',
  endTime: '15:00',
  duration: 60,
  status: 'confirmed' as const,
  totalAmount: 50,
  paymentStatus: 'paid' as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

/**
 * Mock order data
 */
export const createMockOrder = (overrides = {}) => ({
  _id: 'order_test123' as any,
  _creationTime: Date.now(),
  userId: 'user_test123' as any,
  userClerkId: 'user_test123',
  orderNumber: 'ORD-2025-001',
  items: [
    {
      productId: 'product_test123' as any,
      productName: 'Test Product',
      quantity: 1,
      pricePerItem: 50,
      totalPrice: 50,
    },
  ],
  subtotal: 50,
  shippingCost: 10,
  tax: 6,
  totalAmount: 66,
  currency: 'AUD',
  status: 'confirmed' as const,
  paymentStatus: 'paid' as const,
  shippingAddress: {
    name: 'Test User',
    phone: '+61400000000',
    addressLine1: '123 Test St',
    city: 'Melbourne',
    postalCode: '3000',
    country: 'Australia',
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

export * from '@testing-library/react';
