import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { DERRIMUT_BRAND } from "@/constants/branding";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

/**
 * Next.js 16 Best Practices:
 * - Use auth() from Clerk server SDK
 * - Proper error handling
 * - Route configuration exports
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      trainerId, 
      trainerName, 
      sessionType, 
      sessionDate, 
      startTime, 
      duration, 
      amount, 
      notes,
      successUrl,
      cancelUrl 
    } = body;

    // Validate required fields
    if (!trainerId || !trainerName || !sessionType || !sessionDate || !startTime || !duration || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the base URL from the request headers (Next.js 16 pattern)
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: `${sessionType.replace('_', ' ').toUpperCase()} Session with ${trainerName}`,
              description: `${sessionDate} at ${startTime} (${duration} minutes)${notes ? `\nNotes: ${notes}` : ''}`,
              images: [process.env.NEXT_PUBLIC_SITE_URL + DERRIMUT_BRAND.logo.primary],
            },
            unit_amount: Math.round(amount * 100), // Convert to cents (AUD)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || `${baseUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/book-session/${trainerId}`,
      metadata: {
        userId,
        trainerId,
        sessionType,
        sessionDate,
        startTime,
        duration: duration.toString(),
        notes: notes || "",
      },
      customer_email: undefined, // Will be filled by Clerk user email
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    }, { status: 200 });

  } catch (error) {
    // Next.js 16: Better error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error creating checkout session:", errorMessage);
    
    return NextResponse.json(
      { 
        error: "Failed to create checkout session",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// Next.js 16: Export route config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
