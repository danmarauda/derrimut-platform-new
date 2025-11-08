import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

/**
 * Next.js 16 Best Practices:
 * - Proper error handling with typed errors
 * - Route configuration exports
 * - Environment-aware error messages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the base URL from the request headers (Next.js 16 pattern)
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    const { 
      clerkId, 
      cartItems, 
      shippingAddress,
      returnUrl = `${baseUrl}/marketplace/checkout/success`,
      cancelUrl = `${baseUrl}/marketplace/cart`
    } = body;

    // Validate required fields
    if (!clerkId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Calculate totals
    let subtotal = 0;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of cartItems) {
      const itemTotal = item.quantity * item.priceAtTime;
      subtotal += itemTotal;

      // Convert AUD to cents for Stripe (multiply by 100)
      const priceInCents = Math.round(item.priceAtTime * 100);

      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: item.product.name,
            description: item.product.description,
            images: item.product.imageUrl ? [item.product.imageUrl] : [],
            metadata: {
              productId: item.productId,
              category: item.product.category,
            },
          },
          unit_amount: priceInCents,
        },
        quantity: item.quantity,
      });
    }

    // Calculate shipping
    const shippingCost = calculateShipping(subtotal, shippingAddress.city);
    const tax = calculateTax(subtotal);

    // Add shipping as line item if > 0
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: "Shipping & Handling",
            description: `Delivery to ${shippingAddress.city}`,
          },
          unit_amount: Math.round(shippingCost * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    // Add tax as line item
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: "GST (10%)",
            description: "Goods and Services Tax",
          },
          unit_amount: Math.round(tax * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      customer_email: shippingAddress.email || undefined,
      metadata: {
        type: "marketplace_order",
        clerkId,
        subtotal: subtotal.toString(),
        shippingCost: shippingCost.toString(),
        tax: tax.toString(),
        totalAmount: (subtotal + shippingCost + tax).toString(),
        shippingAddress: JSON.stringify(shippingAddress),
      },
      shipping_address_collection: {
        allowed_countries: ["AU"], // Australia only
      },
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      payment_intent_data: {
        metadata: {
          type: "marketplace_order",
          clerkId,
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      totalAmount: subtotal + shippingCost + tax,
    }, { status: 200 });

  } catch (error) {
    // Next.js 16: Better error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error creating marketplace checkout session:", errorMessage);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateShipping(subtotal: number, city: string): number {
  // Free shipping for orders over AUD 200
  if (subtotal >= 200) {
    return 0;
  }

  // Australian shipping rates
  // Major cities - AUD 10
  const majorCities = ["sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra", "darwin", "hobart"];
  if (majorCities.some(cityName => city.toLowerCase().includes(cityName))) {
    return 10;
  }

  // Regional areas - AUD 15
  return 15;
}

function calculateTax(subtotal: number): number {
  // Australian GST - 10%
  return Math.round(subtotal * 0.10);
}

// Next.js 16: Export route config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
