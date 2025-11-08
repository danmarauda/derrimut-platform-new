import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

/**
 * Next.js 16 Best Practices:
 * - Use NextRequest/NextResponse types
 * - Implement proper error handling
 * - Add request validation
 * - Use async/await properly
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, clerkId, membershipType } = body;

    // Validate required parameters
    if (!priceId || !clerkId || !membershipType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get the base URL from the request headers (Next.js 16 pattern)
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Create checkout session for subscription mode
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/membership`,
      metadata: {
        clerkId: clerkId,
        membershipType: membershipType,
      },
    });

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url 
    }, { status: 200 });

  } catch (error) {
    // Next.js 16: Better error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in checkout API route:", errorMessage);
    
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// Next.js 16: Export route config for better type safety
export const runtime = 'nodejs'; // Use Node.js runtime for Stripe API
export const dynamic = 'force-dynamic'; // Force dynamic rendering for payment processing
