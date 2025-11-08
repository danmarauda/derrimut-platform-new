import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16 Best Practices:
 * - Proper error handling
 * - Route configuration exports
 * - Environment-aware responses
 */

// Test the Convex webhook with a mock checkout.session.completed event
export async function POST(req: NextRequest) {
  try {
    const mockEvent = {
      id: "evt_test_" + Date.now(),
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_" + Date.now(),
          mode: "payment",
          payment_status: "paid",
          amount_total: 250000, // AUD 2500 in cents
          payment_intent: "pi_test_" + Date.now(),
          metadata: {
            type: "marketplace_order",
            clerkId: "user_2jK9X6YZ3mNpQrStUvWxH7fL2aB", // Replace with a real user ID from your database
            shippingAddress: JSON.stringify({
              name: "Test User",
              phone: "+61400000000",
              addressLine1: "123 Test Street",
              city: "Melbourne",
              postalCode: "3000",
              country: "AU"
            })
          }
        }
      }
    };

    // Send to Convex webhook
    const convexWebhookUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL!.replace('convex.cloud', 'convex.site')}/stripe-webhook`;
    
    const response = await fetch(convexWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "test-signature-for-development",
      },
      body: JSON.stringify(mockEvent),
    });

    const responseText = await response.text();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      response: responseText,
      mockEvent: mockEvent
    }, { status: response.ok ? 200 : 500 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Test failed:", errorMessage);
    
    return NextResponse.json({
      error: "Test failed",
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Convex webhook test endpoint",
    convexWebhookUrl: `${process.env.NEXT_PUBLIC_CONVEX_URL!.replace('convex.cloud', 'convex.site')}/stripe-webhook`,
    instructions: "Send POST request to test the webhook"
  }, { status: 200 });
}

// Next.js 16: Export route config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
