import { NextRequest, NextResponse } from "next/server";
import { sendContactFormEmail, sendContactFormConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Send to support
    const supportResult = await sendContactFormEmail(body);
    if (!supportResult.success) {
      return NextResponse.json(
        { error: supportResult.error },
        { status: 500 }
      );
    }
    
    // Send confirmation to user
    const confirmationResult = await sendContactFormConfirmationEmail({
      to: body.email,
      name: body.name,
      subject: body.subject,
    });
    
    return NextResponse.json({ 
      success: true,
      supportMessageId: supportResult.messageId,
      confirmationMessageId: confirmationResult.messageId,
    });
  } catch (error) {
    console.error("Error sending contact form emails:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

