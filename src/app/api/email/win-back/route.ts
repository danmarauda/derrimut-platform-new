import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { Resend } from "resend";
import WinBackEmail from "@/emails/WinBackEmail";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const resend = new Resend(process.env.RESEND_API_KEY);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, userName, campaignType, daysSinceLastActivity, membershipType, userId, clerkId } = body;

    if (!to || !campaignType || !userId || !clerkId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get the campaign ID for tracking
    const campaigns = await convex.query(api.winBackCampaigns.getCampaignForUserPublic, {
      userId: userId as any,
    });

    const campaignId = campaigns?._id || null;

    // Render email to HTML
    const emailHtml = render(
      WinBackEmail({
        userName: userName || "Member",
        campaignType,
        daysSinceLastActivity: daysSinceLastActivity || 14,
        membershipType: membershipType || "Premium",
        campaignId: campaignId || undefined,
      })
    );

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "Derrimut 24:7 <notifications@derrimut.aliaslabs.ai>",
      to: [to],
      subject:
        campaignType === "we_miss_you"
          ? "We Miss You at Derrimut 24:7!"
          : campaignType === "come_back"
          ? "Come Back to Derrimut 24:7"
          : "Special Return Offer - Derrimut 24:7",
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error: any) {
    console.error("Error sending win-back email:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

