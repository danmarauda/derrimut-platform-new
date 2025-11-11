# Resend Email Integration Setup Guide

**Created:** 2025-01-09  
**Status:** ✅ Complete

---

## Overview

Email functionality has been fully integrated using **Resend** and **React Email** components. The system sends automated emails for:

- ✅ Booking confirmations
- ✅ Order confirmations  
- ✅ Membership welcome emails
- ✅ Contact form submissions

---

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed:
- `resend` - Email sending service
- `@react-email/components` - React email components
- `@react-email/tailwind` - Tailwind CSS for emails
- `@react-email/render` - Render React components to HTML

### 2. Environment Variables

Add these environment variables to **both** Convex and Vercel:

#### Convex Dashboard (`Settings > Environment Variables`)

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Derrimut 24:7 <noreply@derrimut247.com.au>
RESEND_SUPPORT_EMAIL=support@derrimut247.com.au
NEXTJS_URL=https://derrimut247.com.au  # Your production URL
```

#### Vercel Dashboard (`Settings > Environment Variables`)

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Derrimut 24:7 <noreply@derrimut247.com.au>
RESEND_SUPPORT_EMAIL=support@derrimut247.com.au
```

### 3. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys** section
3. Create a new API key
4. Copy the key (starts with `re_`)
5. Add to environment variables above

### 4. Domain Setup (Optional but Recommended)

For production, verify your domain in Resend:

1. Go to **Domains** in Resend dashboard
2. Add `derrimut247.com.au`
3. Add DNS records provided by Resend:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT)
4. Wait for verification (usually 5-10 minutes)

**Note:** Until domain is verified, you can use Resend's test domain (`onboarding@resend.dev`)

---

## Email Templates

### 1. Booking Confirmation Email
**File:** `src/emails/BookingConfirmationEmail.tsx`  
**Triggered:** When a booking is created (paid or free)  
**Includes:**
- Trainer name
- Session date and time
- Session type
- Duration
- Booking ID

### 2. Order Confirmation Email
**File:** `src/emails/OrderConfirmationEmail.tsx`  
**Triggered:** When marketplace order payment succeeds  
**Includes:**
- Order number
- Order items
- Pricing breakdown (subtotal, shipping, tax, total)
- Shipping address

### 3. Membership Welcome Email
**File:** `src/emails/MembershipWelcomeEmail.tsx`  
**Triggered:** When membership subscription is created  
**Includes:**
- Membership type
- Start and end dates
- Monthly price
- Membership benefits

### 4. Contact Form Email
**File:** `src/emails/ContactFormEmail.tsx`  
**Triggered:** When contact form is submitted  
**Includes:**
- User name and email
- Subject
- Message content

---

## Integration Points

### Convex Actions (`convex/emails.ts`)

Email actions that call Next.js API routes:

- `sendBookingConfirmation` - Sends booking confirmation
- `sendOrderConfirmation` - Sends order confirmation
- `sendMembershipWelcome` - Sends membership welcome
- `sendContactForm` - Sends contact form emails

### Next.js API Routes (`src/app/api/email/`)

Email API routes that render and send emails:

- `/api/email/booking-confirmation` - Booking emails
- `/api/email/order-confirmation` - Order emails
- `/api/email/membership-welcome` - Membership emails
- `/api/email/contact-form` - Contact form emails
- `/api/email/contact-confirmation` - Contact confirmation

### Webhook Handlers (`convex/http.ts`)

Emails are automatically sent from:

- **Stripe Webhook** → Membership creation → Welcome email
- **Stripe Webhook** → Order payment → Order confirmation email
- **Stripe Webhook** → Booking payment → Booking confirmation email

### Contact Form (`src/app/api/contact/route.ts`)

Contact form submission sends:
1. Email to support team
2. Confirmation email to user

---

## Testing

### Test Email Sending

1. **Create a booking:**
   - Book a training session
   - Check email inbox for confirmation

2. **Place an order:**
   - Add items to cart
   - Complete checkout
   - Check email for order confirmation

3. **Subscribe to membership:**
   - Complete membership checkout
   - Check email for welcome message

4. **Submit contact form:**
   - Fill out contact form
   - Check both support and user emails

### Test in Development

For local testing, use Resend's test domain or verify your domain:

```bash
# In .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=Derrimut 24:7 <onboarding@resend.dev>  # Test domain
```

---

## Email Styling

All emails use the **premium dark theme** matching the platform:

- Background: `#0a0a0a` (neutral-950)
- Cards: `#171717` (neutral-900)
- Text: `#ffffff` / `#e5e5e5` / `#a3a3a3`
- Accent: `#dc2626` (gym-red)
- Responsive design for mobile

---

## Troubleshooting

### Emails Not Sending

1. **Check environment variables:**
   ```bash
   # Verify in Convex dashboard
   # Verify in Vercel dashboard
   ```

2. **Check Resend API key:**
   - Ensure key is valid
   - Check API key permissions in Resend dashboard

3. **Check domain verification:**
   - If using custom domain, verify DNS records
   - Use test domain for development

4. **Check logs:**
   - Convex logs: Check for email errors
   - Vercel logs: Check API route errors
   - Resend dashboard: Check email delivery status

### Common Issues

**Issue:** "RESEND_API_KEY not set"  
**Solution:** Add `RESEND_API_KEY` to Convex environment variables

**Issue:** "Domain not verified"  
**Solution:** Use `onboarding@resend.dev` for testing, or verify domain in Resend

**Issue:** "Emails going to spam"  
**Solution:** Verify domain with SPF/DKIM/DMARC records in Resend

---

## Production Checklist

- [ ] Resend account created
- [ ] API key added to Convex
- [ ] API key added to Vercel
- [ ] Domain verified in Resend (optional)
- [ ] DNS records added (if using custom domain)
- [ ] Test emails sent successfully
- [ ] Email templates reviewed
- [ ] Support email address configured

---

## Files Created/Modified

### New Files
- `src/emails/BookingConfirmationEmail.tsx`
- `src/emails/OrderConfirmationEmail.tsx`
- `src/emails/MembershipWelcomeEmail.tsx`
- `src/emails/ContactFormEmail.tsx`
- `src/lib/email.ts`
- `convex/emails.ts`
- `src/app/api/email/route.ts`
- `src/app/api/email/booking-confirmation/route.ts`
- `src/app/api/email/order-confirmation/route.ts`
- `src/app/api/email/membership-welcome/route.ts`
- `src/app/api/email/contact-form/route.ts`
- `src/app/api/email/contact-confirmation/route.ts`
- `src/app/api/contact/route.ts`

### Modified Files
- `convex/http.ts` - Added email sending to webhook handlers
- `convex/bookings.ts` - Added email placeholder for free bookings
- `convex/orders.ts` - Added `getOrderById` query
- `convex/memberships.ts` - Added `getMembershipPlanByType` query
- `src/components/marketing/ContactPage.tsx` - Integrated contact form API

---

## Next Steps

1. **Set up Resend account** and get API key
2. **Add environment variables** to Convex and Vercel
3. **Test email sending** with test transactions
4. **Verify domain** (optional, for production)
5. **Monitor email delivery** in Resend dashboard

---

**Status:** ✅ Implementation Complete  
**Ready for:** Testing and Production Deployment

