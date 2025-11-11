import { NextRequest, NextResponse } from "next/server";
import {
  sendBookingConfirmationEmail,
  sendOrderConfirmationEmail,
  sendMembershipWelcomeEmail,
  sendContactFormEmail,
  sendContactFormConfirmationEmail,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...params } = body;

    switch (type) {
      case "booking-confirmation":
        const bookingResult = await sendBookingConfirmationEmail(params);
        if (!bookingResult.success) {
          return NextResponse.json(
            { error: bookingResult.error },
            { status: 500 }
          );
        }
        return NextResponse.json({ messageId: bookingResult.messageId });

      case "order-confirmation":
        const orderResult = await sendOrderConfirmationEmail(params);
        if (!orderResult.success) {
          return NextResponse.json(
            { error: orderResult.error },
            { status: 500 }
          );
        }
        return NextResponse.json({ messageId: orderResult.messageId });

      case "membership-welcome":
        const membershipResult = await sendMembershipWelcomeEmail(params);
        if (!membershipResult.success) {
          return NextResponse.json(
            { error: membershipResult.error },
            { status: 500 }
          );
        }
        return NextResponse.json({ messageId: membershipResult.messageId });

      case "contact-form":
        const contactResult = await sendContactFormEmail(params);
        if (!contactResult.success) {
          return NextResponse.json(
            { error: contactResult.error },
            { status: 500 }
          );
        }
        return NextResponse.json({ messageId: contactResult.messageId });

      case "contact-confirmation":
        const confirmationResult = await sendContactFormConfirmationEmail(params);
        if (!confirmationResult.success) {
          return NextResponse.json(
            { error: confirmationResult.error },
            { status: 500 }
          );
        }
        return NextResponse.json({ messageId: confirmationResult.messageId });

      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in email API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

