import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import MarketingEmail from "@/emails/MarketingEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, campaignId, recipientClerkId } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Render email with tracking
    const emailHtml = await render(
      MarketingEmail({
        subject,
        content: html,
        campaignId,
        recipientClerkId,
      })
    );

    const { data, error } = await resend.emails.send({
      from: "Derrimut Gym <noreply@derrimutgym.com.au>",
      to: [to],
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error sending marketing email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}

