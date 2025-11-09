import { NextRequest, NextResponse } from "next/server";

// This route has been moved to Convex HTTP handler
// Keeping for backwards compatibility
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "This endpoint has been moved to Convex. Please use the Convex HTTP handler instead." },
    { status: 410 }
  );
}

