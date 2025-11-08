import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Next.js 16 Best Practices:
 * - Proper error handling
 * - Route configuration exports
 * - Environment-aware responses
 */
export async function POST(req: NextRequest) {
  try {
    // Test Convex connection
    try {
      const users = await convex.query(api.users.getAllUsers, {});
      console.log("✅ Convex connection successful. User count:", users?.length || 0);
    } catch (convexError) {
      const errorMessage = convexError instanceof Error ? convexError.message : String(convexError);
      console.error("❌ Convex connection failed:", errorMessage);
      
      return NextResponse.json({ 
        error: "Convex connection failed", 
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      }, { status: 500 });
    }

    // Test creating a mock order (for testing)
    const testOrderData = {
      clerkId: "test_user_123",
      shippingAddress: {
        name: "Test User",
        phone: "+61400000000",
        addressLine1: "123 Test Street",
        city: "Melbourne",
        postalCode: "3000",
        country: "AU"
      },
      stripeSessionId: "cs_test_" + Date.now()
    };

    console.log("🧪 Testing order creation with mock data...");
    
    try {
      // This will likely fail because the test user doesn't exist, but it will tell us if the function is callable
      await convex.mutation(api.orders.createOrderFromCart, testOrderData);
      console.log("✅ Order creation function is accessible");
    } catch (orderError) {
      const errorMessage = orderError instanceof Error ? orderError.message : String(orderError);
      console.log("📋 Order creation error (expected):", errorMessage);
      
      // If the error is about user not found, that's expected and good
      if (orderError instanceof Error && errorMessage.includes("User not found")) {
        console.log("✅ Order creation function is working (user validation passed)");
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Webhook test completed",
      convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Webhook test failed:", errorMessage);
    
    return NextResponse.json({ 
      error: "Test failed", 
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: "Webhook test endpoint is running",
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    timestamp: new Date().toISOString()
  }, { status: 200 });
}

// Next.js 16: Export route config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
