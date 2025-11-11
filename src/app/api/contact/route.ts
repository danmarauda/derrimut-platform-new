import { NextRequest, NextResponse } from "next/server";
import { sendContactFormEmail, sendContactFormConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Send emails
    const supportResult = await sendContactFormEmail({
      name,
      email,
      subject,
      message,
    });

    const confirmationResult = await sendContactFormConfirmationEmail({
      to: email,
      name,
      subject,
    });

    if (!supportResult.success || !confirmationResult.success) {
      return NextResponse.json(
        { error: "Failed to send emails" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Contact form submitted successfully"
    });
  } catch (error) {
    console.error("Error handling contact form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

