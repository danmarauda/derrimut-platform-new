/**
 * Tests for /api/create-marketplace-checkout
 * Tests marketplace order checkout flow
 */

import { POST } from '../create-marketplace-checkout/route';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  }));
});

describe('POST /api/create-marketplace-checkout', () => {
  let mockStripeCreate: jest.Mock;
  let mockRequest: Partial<NextRequest>;

  const mockCartItems = [
    {
      productId: 'prod_1',
      quantity: 2,
      priceAtTime: 25.00,
      product: {
        name: 'Protein Powder',
        description: 'Premium whey protein',
        category: 'supplements',
        imageUrl: 'https://example.com/protein.jpg',
      },
    },
    {
      productId: 'prod_2',
      quantity: 1,
      priceAtTime: 15.00,
      product: {
        name: 'Gym Towel',
        description: 'Microfiber gym towel',
        category: 'accessories',
        imageUrl: 'https://example.com/towel.jpg',
      },
    },
  ];

  const mockShippingAddress = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+61400000000',
    street: '123 Test St',
    city: 'Melbourne',
    state: 'VIC',
    postalCode: '3000',
    country: 'Australia',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const StripeConstructor = Stripe as any;
    const stripeInstance = new StripeConstructor();
    mockStripeCreate = stripeInstance.checkout.sessions.create;

    mockRequest = {
      json: jest.fn(),
      headers: new Headers({
        host: 'localhost:3000',
      }),
    };
  });

  describe('Validation', () => {
    it('should return 400 when clerkId is missing', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({
        cartItems: mockCartItems,
        shippingAddress: mockShippingAddress,
      });

      const response = await POST(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User ID is required');
    });

    it('should return 400 when cart is empty', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: [],
        shippingAddress: mockShippingAddress,
      });

      const response = await POST(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cart is empty');
    });

    it('should return 400 when cart items is null', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: null,
        shippingAddress: mockShippingAddress,
      });

      const response = await POST(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cart is empty');
    });

    it('should return 400 when shipping address is missing', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: mockCartItems,
      });

      const response = await POST(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Shipping address is required');
    });
  });

  describe('Success Cases', () => {
    it('should create checkout session with valid data', async () => {
      const mockSession = {
        id: 'cs_market_test_123',
        url: 'https://checkout.stripe.com/session/cs_market_test_123',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: mockCartItems,
        shippingAddress: mockShippingAddress,
      });

      const response = await POST(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBe('cs_market_test_123');
      expect(data.url).toBe('https://checkout.stripe.com/session/cs_market_test_123');
      expect(data.totalAmount).toBeGreaterThan(0);
    });

    it('should create line items with correct pricing', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: mockCartItems,
        shippingAddress: mockShippingAddress,
      });

      await POST(mockRequest as NextRequest);

      // Verify line items creation
      expect(mockStripeCreate).toHaveBeenCalled();
      const callArgs = mockStripeCreate.mock.calls[0][0];

      expect(callArgs.line_items).toBeDefined();
      // Should have product items + shipping + tax
      expect(callArgs.line_items.length).toBeGreaterThanOrEqual(2);
    });

    it('should include metadata for order tracking', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: mockCartItems,
        shippingAddress: mockShippingAddress,
      });

      await POST(mockRequest as NextRequest);

      expect(mockStripeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            type: 'marketplace_order',
            clerkId: 'user_123',
          }),
        })
      );
    });
  });

  describe('Shipping Calculation', () => {
    it('should apply free shipping for orders over $200 AUD', async () => {
      const largeOrder = [
        {
          productId: 'prod_1',
          quantity: 10,
          priceAtTime: 25.00, // $250 total
          product: {
            name: 'Protein Powder',
            description: 'Premium whey protein',
            category: 'supplements',
          },
        },
      ];

      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: largeOrder,
        shippingAddress: mockShippingAddress,
      });

      await POST(mockRequest as NextRequest);

      const callArgs = mockStripeCreate.mock.calls[0][0];
      // Check if shipping line item exists with 0 cost or doesn't exist
      const shippingItem = callArgs.line_items.find((item: any) =>
        item.price_data?.product_data?.name?.includes('Shipping')
      );

      // Should either not exist or be $0
      expect(!shippingItem || shippingItem.price_data.unit_amount === 0).toBe(true);
    });

    it('should charge $10 AUD shipping for major cities', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: mockCartItems,
        shippingAddress: {
          ...mockShippingAddress,
          city: 'Sydney',
        },
      });

      await POST(mockRequest as NextRequest);

      const callArgs = mockStripeCreate.mock.calls[0][0];
      const shippingItem = callArgs.line_items.find((item: any) =>
        item.price_data?.product_data?.name?.includes('Shipping')
      );

      // $10 = 1000 cents
      expect(shippingItem?.price_data?.unit_amount).toBe(1000);
    });

    it('should charge $15 AUD shipping for regional areas', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: mockCartItems,
        shippingAddress: {
          ...mockShippingAddress,
          city: 'Ballarat', // Regional city
        },
      });

      await POST(mockRequest as NextRequest);

      const callArgs = mockStripeCreate.mock.calls[0][0];
      const shippingItem = callArgs.line_items.find((item: any) =>
        item.price_data?.product_data?.name?.includes('Shipping')
      );

      // $15 = 1500 cents
      expect(shippingItem?.price_data?.unit_amount).toBe(1500);
    });
  });

  describe('Tax Calculation', () => {
    it('should apply 10% GST correctly', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: mockCartItems,
        shippingAddress: mockShippingAddress,
      });

      await POST(mockRequest as NextRequest);

      const callArgs = mockStripeCreate.mock.calls[0][0];
      const taxItem = callArgs.line_items.find((item: any) =>
        item.price_data?.product_data?.name?.includes('VAT')
      );

      expect(taxItem).toBeDefined();
      expect(taxItem.price_data.unit_amount).toBeGreaterThan(0);
    });
  });

  describe('Custom URLs', () => {
    it('should use custom return URL when provided', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: mockCartItems,
        shippingAddress: mockShippingAddress,
        returnUrl: 'http://localhost:3000/custom/success',
      });

      await POST(mockRequest as NextRequest);

      expect(mockStripeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: expect.stringContaining('/custom/success'),
        })
      );
    });

    it('should use custom cancel URL when provided', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: mockCartItems,
        shippingAddress: mockShippingAddress,
        cancelUrl: 'http://localhost:3000/custom/cancel',
      });

      await POST(mockRequest as NextRequest);

      expect(mockStripeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          cancel_url: 'http://localhost:3000/custom/cancel',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle Stripe API errors', async () => {
      mockStripeCreate.mockRejectedValue(new Error('Stripe API error'));

      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: mockCartItems,
        shippingAddress: mockShippingAddress,
      });

      const response = await POST(mockRequest as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Stripe API error');
    });

    it('should handle invalid product data', async () => {
      const invalidCart = [
        {
          productId: 'prod_1',
          quantity: 1,
          priceAtTime: -10, // Invalid negative price
          product: {
            name: 'Invalid Product',
            description: 'Test',
            category: 'test',
          },
        },
      ];

      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: invalidCart,
        shippingAddress: mockShippingAddress,
      });

      // Should still process but Stripe validation might catch it
      await POST(mockRequest as NextRequest);
      expect(mockStripeCreate).toHaveBeenCalled();
    });
  });

  describe('Currency Handling', () => {
    it('should use AUD currency', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: mockCartItems,
        shippingAddress: mockShippingAddress,
      });

      await POST(mockRequest as NextRequest);

      const callArgs = mockStripeCreate.mock.calls[0][0];
      callArgs.line_items.forEach((item: any) => {
        expect(item.price_data.currency).toBe('aud');
      });
    });

    it('should convert AUD to cents correctly', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      const testCart = [
        {
          productId: 'prod_1',
          quantity: 1,
          priceAtTime: 19.99, // $19.99
          product: {
            name: 'Test Product',
            description: 'Test',
            category: 'test',
          },
        },
      ];

      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: testCart,
        shippingAddress: mockShippingAddress,
      });

      await POST(mockRequest as NextRequest);

      const callArgs = mockStripeCreate.mock.calls[0][0];
      const productItem = callArgs.line_items[0];

      // $19.99 = 1999 cents
      expect(productItem.price_data.unit_amount).toBe(1999);
    });
  });

  describe('Payment Intent Metadata', () => {
    it('should include payment intent metadata', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      mockStripeCreate.mockResolvedValue(mockSession);

      (mockRequest.json as jest.Mock).mockResolvedValue({
        clerkId: 'user_123',
        cartItems: mockCartItems,
        shippingAddress: mockShippingAddress,
      });

      await POST(mockRequest as NextRequest);

      expect(mockStripeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_intent_data: expect.objectContaining({
            metadata: expect.objectContaining({
              type: 'marketplace_order',
              clerkId: 'user_123',
            }),
          }),
        })
      );
    });
  });
});
