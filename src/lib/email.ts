import { render } from "@react-email/render";
import { Resend } from "resend";

// Email templates
import { BookingConfirmationEmail } from "../emails/BookingConfirmationEmail";
import { OrderConfirmationEmail } from "../emails/OrderConfirmationEmail";
import { MembershipWelcomeEmail } from "../emails/MembershipWelcomeEmail";
import { ContactFormEmail } from "../emails/ContactFormEmail";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Derrimut 24:7 <noreply@derrimut247.com.au>";
const SUPPORT_EMAIL = process.env.RESEND_SUPPORT_EMAIL || "support@derrimut247.com.au";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTJS_URL || "https://derrimut.aliaslabs.ai";

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(params: {
  to: string;
  userName: string;
  trainerName: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
  duration: number;
  bookingId: string;
}) {
  try {
    const html = await render(
      BookingConfirmationEmail({
        userName: params.userName,
        trainerName: params.trainerName,
        sessionDate: params.sessionDate,
        sessionTime: params.sessionTime,
        sessionType: params.sessionType,
        duration: params.duration,
        bookingId: params.bookingId,
      })
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Booking Confirmed: ${params.trainerName} - ${new Date(params.sessionDate).toLocaleDateString('en-AU')}`,
      html,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(params: {
  to: string;
  userName: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
}) {
  try {
    const html = await render(
      OrderConfirmationEmail({
        userName: params.userName,
        orderNumber: params.orderNumber,
        orderDate: params.orderDate,
        items: params.items,
        subtotal: params.subtotal,
        shipping: params.shipping,
        tax: params.tax,
        total: params.total,
        shippingAddress: params.shippingAddress,
      })
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Order Confirmation #${params.orderNumber}`,
      html,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send membership welcome email
 */
export async function sendMembershipWelcomeEmail(params: {
  to: string;
  userName: string;
  membershipType: string;
  startDate: string;
  endDate: string;
  price: number;
}) {
  try {
    const html = await render(
      MembershipWelcomeEmail({
        userName: params.userName,
        membershipType: params.membershipType,
        startDate: params.startDate,
        endDate: params.endDate,
        price: params.price,
      })
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: "Welcome to Derrimut 24:7 Gym!",
      html,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Error sending membership welcome email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send contact form email to support
 */
export async function sendContactFormEmail(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    const html = await render(
      ContactFormEmail({
        name: params.name,
        email: params.email,
        subject: params.subject,
        message: params.message,
      })
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: SUPPORT_EMAIL,
      replyTo: params.email,
      subject: `Contact Form: ${params.subject}`,
      html,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Error sending contact form email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send contact form confirmation email to user
 */
export async function sendContactFormConfirmationEmail(params: {
  to: string;
  name: string;
  subject: string;
}) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #0a0a0a; color: rgba(255, 255, 255, 0.9); padding: 20px 0; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a;">
            <!-- Header -->
            <div style="background-color: rgba(255, 255, 255, 0.05); border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding: 24px 32px; text-align: center; margin-bottom: 32px;">
              <div style="margin-bottom: 12px;">
                <img src="${BASE_URL}/logos/derrimut-logo-primary.png" alt="Derrimut 24:7 Gym" width="48" height="48" style="display: block; margin: 0 auto;">
              </div>
              <div style="color: #ffffff; font-size: 18px; font-weight: 600; letter-spacing: 0.5px; margin: 0 0 4px; text-transform: uppercase;">DERRIMUT GYM</div>
              <div style="color: rgba(255, 255, 255, 0.6); font-size: 11px; font-weight: 400; letter-spacing: 2px; margin: 0; text-transform: uppercase;">24/7 FITNESS</div>
            </div>
            
            <!-- Content -->
            <div style="padding: 0 32px 32px;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px; margin: 0 0 24px; line-height: 1.2;">Thank You for Contacting Us!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; line-height: 24px; margin: 16px 0;">
                Hi ${params.name},
              </p>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; line-height: 24px; margin: 16px 0;">
                We've received your message regarding "${params.subject}" and our team will get back to you within 24-48 hours.
              </p>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; line-height: 24px; margin: 16px 0;">
                If you have any urgent questions, please call us at <a href="tel:+61393387375" style="color: #dc2626; text-decoration: underline; font-weight: 500;">+61 3 9338 7375</a>.
              </p>
            </div>
            
            <!-- Footer -->
            <hr style="border-color: rgba(255, 255, 255, 0.1); border-width: 1px; border-style: solid; margin: 32px 0;">
            <div style="padding: 24px 32px; text-align: center;">
              <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 20px; margin: 8px 0;">
                <a href="${BASE_URL}" style="color: #dc2626; text-decoration: underline; font-weight: 500;">Visit Website</a> • <a href="${BASE_URL}/contact" style="color: #dc2626; text-decoration: underline; font-weight: 500;">Contact Us</a>
              </p>
              <p style="color: rgba(255, 255, 255, 0.5); font-size: 12px; line-height: 18px; margin: 16px 0 0;">
                © 2025 Derrimut 24:7 Gym - All rights reserved
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: "We've received your message",
      html,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Error sending contact form confirmation email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

