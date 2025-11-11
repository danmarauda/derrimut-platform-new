import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await sendBookingConfirmationEmail(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ messageId: result.messageId });
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

