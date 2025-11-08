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
export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoint disabled in production' },
      { status: 403 }
    );
  }

  try {
    // Check users
    let users = [];
    try {
      users = await convex.query(api.users.getAllUsers, {});
    } catch (userError) {
      const errorMessage = userError instanceof Error ? userError.message : String(userError);
      console.error("❌ Users query failed:", errorMessage);
      
      return NextResponse.json({ 
        error: "Users query failed",
        details: errorMessage
      }, { status: 500 });
    }
    
    // Check marketplace items  
    let marketplaceItems = [];
    try {
      marketplaceItems = await convex.query(api.marketplace.getMarketplaceItems, {});
    } catch (marketError) {
      console.error("❌ Marketplace query failed:", marketError);
    }

    return NextResponse.json({
      users: users?.length || 0,
      marketplaceItems: marketplaceItems?.length || 0,
      sampleUsers: users?.slice(0, 3).map(u => ({ 
        id: u._id, 
        clerkId: u.clerkId, 
        name: u.name 
      })) || [],
      convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL
    }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Database check failed:", errorMessage);
    
    return NextResponse.json({ 
      error: "Database check failed",
      details: errorMessage
    }, { status: 500 });
  }
}

// Next.js 16: Export route config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
