/**
 * Tests for /api/create-checkout-session
 * Critical payment flow tests for membership subscriptions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../create-checkout-session/route';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

// Mock Stripe
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: vi.fn(),
        },
      },
    })),
  };
});

describe('POST /api/create-checkout-session', () => {
  let mockStripeCreate: ReturnType<typeof vi.fn>;
  let mockRequest: Partial<NextRequest>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Get the mocked Stripe instance
    const StripeConstructor = Stripe as any;
    const stripeInstance = new StripeConstructor();
    mockStripeCreate = stripeInstance.checkout.sessions.create;

    // Setup mock request
    mockRequest = {
      json: vi.fn(),
      headers: new Headers({
        host: 'localhost:3000',
      }),
    };
  });

  describe('Validation', () => {
    it('should return 400 when priceId is missing', async () => {
      (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
        clerkId: 'user_123',
        membershipType: 'standard',
      });

      const response = await POST(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });

    it('should return 400 when clerkId is missing', async () => {
      (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
        priceId: 'price_123',
        membershipType: 'standard',
      });

      const response = await POST(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });

    it('should return 400 when membershipType is missing', async () => {
      (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
        priceId: 'price_123',
        clerkId: 'user_123',
      });

      const response = await POST(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });
  });

  describe('Success Cases', () => {
    it('should create checkout session with valid data', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session/cs_test_123',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
        priceId: 'price_123',
        clerkId: 'user_123',
        membershipType: 'standard',
      });

      const response = await POST(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBe('cs_test_123');
      expect(data.url).toBe('https://checkout.stripe.com/session/cs_test_123');
    });

    it('should create session with correct Stripe parameters', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session/cs_test_123',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
        priceId: 'price_standard_monthly',
        clerkId: 'user_456',
        membershipType: 'no-lock-in',
      });

      await POST(mockRequest as NextRequest);

      expect(mockStripeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ['card'],
          mode: 'subscription',
          line_items: [
            {
              price: 'price_standard_monthly',
              quantity: 1,
            },
          ],
          metadata: {
            clerkId: 'user_456',
            membershipType: 'no-lock-in',
          },
        })
      );
    });

    it('should set correct success and cancel URLs', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session/cs_test_123',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
        priceId: 'price_123',
        clerkId: 'user_123',
        membershipType: 'standard',
      });

      await POST(mockRequest as NextRequest);

      expect(mockStripeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: expect.stringContaining('/membership/success?session_id={CHECKOUT_SESSION_ID}'),
          cancel_url: expect.stringContaining('/membership'),
        })
      );
    });

    it('should handle HTTPS protocol from headers', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session/cs_test_123',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      mockRequest.headers = new Headers({
        host: 'app.derrimut.com',
        'x-forwarded-proto': 'https',
      });

      (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
        priceId: 'price_123',
        clerkId: 'user_123',
        membershipType: 'standard',
      });

      await POST(mockRequest as NextRequest);

      expect(mockStripeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: expect.stringMatching(/^https:\/\//),
          cancel_url: expect.stringMatching(/^https:\/\//),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle Stripe API errors gracefully', async () => {
      mockStripeCreate.mockRejectedValue(new Error('Invalid price ID'));

      (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
        priceId: 'price_invalid',
        clerkId: 'user_123',
        membershipType: 'standard',
      });

      const response = await POST(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(data.details).toBe('Invalid price ID');
    });

    it('should handle network errors', async () => {
      mockStripeCreate.mockRejectedValue(new Error('Network timeout'));

      (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
        priceId: 'price_123',
        clerkId: 'user_123',
        membershipType: 'standard',
      });

      const response = await POST(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle malformed JSON gracefully', async () => {
      (mockRequest.json as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Invalid JSON'));

      const response = await POST(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('Different Membership Types', () => {
    const membershipTypes = [
      'no-lock-in',
      '6-month',
      '12-month',
      'couples',
      'student',
    ];

    membershipTypes.forEach(type => {
      it(`should create session for ${type} membership`, async () => {
        const mockSession = {
          id: `cs_test_${type}`,
          url: `https://checkout.stripe.com/session/cs_test_${type}`,
        };

        mockStripeCreate.mockResolvedValue(mockSession);

        (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
          priceId: `price_${type}`,
          clerkId: 'user_123',
          membershipType: type,
        });

        const response = await POST(mockRequest as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.sessionId).toBe(`cs_test_${type}`);
      });
    });
  });

  describe('Security', () => {
    it('should not expose sensitive data in error messages', async () => {
      mockStripeCreate.mockRejectedValue(new Error('Stripe secret key invalid: sk_live_123abc'));

      (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
        priceId: 'price_123',
        clerkId: 'user_123',
        membershipType: 'standard',
      });

      const response = await POST(mockRequest as NextRequest);
      const data = await response.json();

      expect(data.details).not.toContain('sk_live');
    });

    it('should include metadata for webhook processing', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session/cs_test_123',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
        priceId: 'price_123',
        clerkId: 'user_clerk_789',
        membershipType: 'premium',
      });

      await POST(mockRequest as NextRequest);

      expect(mockStripeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            clerkId: 'user_clerk_789',
            membershipType: 'premium',
          }),
        })
      );
    });
  });
});
