import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { Resend } from "resend";
import ReferralEmail from "@/emails/ReferralEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, referrerName, referralCode, referralLink, reward } = body;

    if (!to || !referrerName || !referralCode || !referralLink) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Render email to HTML
    const emailHtml = render(
      ReferralEmail({
        referrerName,
        referralCode,
        referralLink,
        reward: reward || "50% off first month",
      })
    );

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Derrimut 24:7 <notifications@derrimut.aliaslabs.ai>",
      to: [to],
      subject: "Share Derrimut 24:7 and Earn Rewards!",
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error: any) {
    console.error("Error sending referral email:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

