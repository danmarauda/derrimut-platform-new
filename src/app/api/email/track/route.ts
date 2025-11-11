import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Track email open (pixel tracking)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const campaignId = searchParams.get("campaignId");

  if (campaignId) {
    try {
      // Track email open
      await convex.mutation(api.winBackCampaigns.trackEmailOpenPublic, {
        campaignId: campaignId as any,
      });
    } catch (error) {
      console.error("Error tracking email open:", error);
    }
  }

  // Return 1x1 transparent pixel
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );

  return new NextResponse(pixel, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

// Track email click
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId } = body;

    if (campaignId) {
      await convex.mutation(api.winBackCampaigns.trackEmailClickPublic, {
        campaignId: campaignId as any,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error tracking email click:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

