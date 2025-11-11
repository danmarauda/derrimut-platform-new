import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

// Initialize Resend client
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
};

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Derrimut 24:7 <noreply@derrimut247.com.au>";
const SUPPORT_EMAIL = process.env.RESEND_SUPPORT_EMAIL || "support@derrimut247.com.au";

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmation = action({
  args: {
    to: v.string(),
    userName: v.string(),
    trainerName: v.string(),
    sessionDate: v.string(),
    sessionTime: v.string(),
    sessionType: v.string(),
    duration: v.number(),
    bookingId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const resend = getResend();
      
      // Call Next.js API route to render and send email
      const nextjsUrl = process.env.NEXTJS_URL || process.env.NEXT_PUBLIC_CONVEX_URL?.replace('/convex', '') || 'http://localhost:3000';
      const response = await fetch(`${nextjsUrl}/api/email/booking-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: args.to,
          userName: args.userName,
          trainerName: args.trainerName,
          sessionDate: args.sessionDate,
          sessionTime: args.sessionTime,
          sessionType: args.sessionType,
          duration: args.duration,
          bookingId: args.bookingId,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Email API error: ${error.error || response.statusText}`);
      }

      const result = await response.json();
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Error sending booking confirmation email:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  },
});

/**
 * Send order confirmation email
 */
export const sendOrderConfirmation = action({
  args: {
    to: v.string(),
    userName: v.string(),
    orderNumber: v.string(),
    orderDate: v.string(),
    items: v.array(v.object({
      name: v.string(),
      quantity: v.number(),
      price: v.number(),
    })),
    subtotal: v.number(),
    shipping: v.number(),
    tax: v.number(),
    total: v.number(),
    shippingAddress: v.object({
      name: v.string(),
      addressLine1: v.string(),
      addressLine2: v.optional(v.string()),
      city: v.string(),
      postalCode: v.string(),
      country: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    try {
      const nextjsUrl = process.env.NEXTJS_URL || process.env.NEXT_PUBLIC_CONVEX_URL?.replace('/convex', '') || 'http://localhost:3000';
      const response = await fetch(`${nextjsUrl}/api/email/order-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: args.to,
          userName: args.userName,
          orderNumber: args.orderNumber,
          orderDate: args.orderDate,
          items: args.items,
          subtotal: args.subtotal,
          shipping: args.shipping,
          tax: args.tax,
          total: args.total,
          shippingAddress: args.shippingAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Email API error: ${error.error || response.statusText}`);
      }

      const result = await response.json();
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  },
});

/**
 * Send membership welcome email
 */
export const sendMembershipWelcome = action({
  args: {
    to: v.string(),
    userName: v.string(),
    membershipType: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const nextjsUrl = process.env.NEXTJS_URL || process.env.NEXT_PUBLIC_CONVEX_URL?.replace('/convex', '') || 'http://localhost:3000';
      const response = await fetch(`${nextjsUrl}/api/email/membership-welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: args.to,
          userName: args.userName,
          membershipType: args.membershipType,
          startDate: args.startDate,
          endDate: args.endDate,
          price: args.price,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Email API error: ${error.error || response.statusText}`);
      }

      const result = await response.json();
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Error sending membership welcome email:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  },
});

/**
 * Send contact form email
 */
export const sendContactForm = action({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const nextjsUrl = process.env.NEXTJS_URL || process.env.NEXT_PUBLIC_CONVEX_URL?.replace('/convex', '') || 'http://localhost:3000';
      
      // Send to support
      const supportResponse = await fetch(`${nextjsUrl}/api/email/contact-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: args.name,
          email: args.email,
          subject: args.subject,
          message: args.message,
        }),
      });

      // Send confirmation to user
      const confirmationResponse = await fetch(`${nextjsUrl}/api/email/contact-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: args.email,
          name: args.name,
          subject: args.subject,
        }),
      });

      if (!supportResponse.ok || !confirmationResponse.ok) {
        throw new Error("Failed to send contact form emails");
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending contact form emails:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  },
});

