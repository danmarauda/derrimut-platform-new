/**
 * Marketplace Validation Schemas
 *
 * Zod schemas for validating marketplace/e-commerce data.
 *
 * Task: 2.1 - Input Validation
 */

import { z } from 'zod';

// Order status enum
export const orderStatusSchema = z.enum([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
], { message: 'Invalid order status' });

// Payment status enum
export const orderPaymentStatusSchema = z.enum([
  'pending',
  'paid',
  'failed',
  'refunded'
], { message: 'Invalid payment status' });

// Shipping address schema
export const shippingAddressSchema = z.object({
  street: z.string().min(1, 'Street is required').max(200, 'Street too long'),
  city: z.string().min(1, 'City is required').max(100, 'City too long'),
  state: z.string().min(1, 'State is required').max(100, 'State too long'),
  postcode: z.string().regex(/^\d{4}$/, 'Postcode must be 4 digits'),
  country: z.string().default('Australia'),
  phone: z.string().regex(/^(\+61|0)[2-478]( ?\d){8}$/, 'Invalid Australian phone number').optional(),
});

// Cart item schema
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity cannot exceed 99'),
  priceAtPurchase: z.number().positive('Price must be positive'),
});

// Create order schema
export const createOrderSchema = z.object({
  clerkId: z.string().min(1, 'User Clerk ID is required'),
  shippingAddress: shippingAddressSchema,
  items: z.array(cartItemSchema).min(1, 'Order must contain at least one item'),
  stripeSessionId: z.string().startsWith('cs_', 'Invalid Stripe session ID').optional(),
});

// Create order from cart schema (webhook)
export const createOrderFromCartSchema = z.object({
  clerkId: z.string().min(1, 'User Clerk ID is required'),
  shippingAddress: shippingAddressSchema,
  stripeSessionId: z.string().startsWith('cs_', 'Invalid Stripe session ID'),
});

// Update order schema
export const updateOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  status: orderStatusSchema.optional(),
  trackingNumber: z.string().max(100).optional(),
  estimatedDelivery: z.string().datetime().optional(),
});

// Update payment status schema
export const updatePaymentStatusSchema = z.object({
  stripeSessionId: z.string().startsWith('cs_', 'Invalid Stripe session ID'),
  paymentStatus: orderPaymentStatusSchema,
  stripePaymentIntentId: z.string().startsWith('pi_', 'Invalid payment intent ID').optional(),
});

// Add to cart schema
export const addToCartSchema = z.object({
  clerkId: z.string().min(1, 'User Clerk ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity cannot exceed 99').default(1),
});

// Update cart item schema
export const updateCartItemSchema = z.object({
  clerkId: z.string().min(1, 'User Clerk ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative').max(99, 'Quantity cannot exceed 99'),
});

// Remove from cart schema
export const removeFromCartSchema = z.object({
  clerkId: z.string().min(1, 'User Clerk ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
});

// Marketplace checkout metadata schema
export const marketplaceCheckoutMetadataSchema = z.object({
  clerkId: z.string().min(1),
  shippingAddress: z.string().min(1), // JSON stringified shippingAddressSchema
  type: z.literal('marketplace_order'),
});

// Type exports
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderPaymentStatus = z.infer<typeof orderPaymentStatusSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateOrderFromCartInput = z.infer<typeof createOrderFromCartSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;
export type MarketplaceCheckoutMetadata = z.infer<typeof marketplaceCheckoutMetadataSchema>;
