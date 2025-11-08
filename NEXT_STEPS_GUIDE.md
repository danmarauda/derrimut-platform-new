# 🚀 Next Steps: Complete Setup Guide

## Step 1: Initialize Convex (Required for Webhooks)

Convex needs to be initialized to get your deployment URL. Here's how:

### Option A: Quick Initialize (Recommended)
```bash
# This will initialize Convex and show you the deployment URL
npx convex dev --once
```

This will:
- Create `convex.json` with your deployment info
- Deploy your functions
- Show your deployment URL

### Option B: Full Dev Mode
```bash
# Run Convex in watch mode (keeps running)
npx convex dev
```

**Note:** This keeps running and watches for changes. You can stop it with Ctrl+C after you get the URL.

### What to Look For
After running, you'll see output like:
```
Deployment URL: https://your-deployment-name.convex.site
```

Copy this URL - you'll need it for webhooks!

---

## Step 2: Configure Webhooks

Once you have your Convex URL:

### 2a. Update .env.local
Add your Convex URL to `.env.local`:
```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.site
```

### 2b. Run Webhook Configuration Script
```bash
npm run stripe:configure-webhooks
```

This will show you:
- Your webhook URL: `https://your-deployment-name.convex.site/stripe-webhook`
- Instructions for configuring in Stripe Dashboard

### 2c. Configure in Stripe Dashboard

**For Production:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter: `https://your-deployment-name.convex.site/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the "Signing secret" (starts with `whsec_`)
6. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

**For Testing (Stripe CLI):**
```bash
stripe listen --forward-to https://your-deployment-name.convex.site/stripe-webhook
```

This will output a webhook secret - add it to `.env.local`.

---

## Step 3: Test Webhooks

After configuring webhooks:

```bash
# Test checkout completion
npm run stripe:test-webhooks checkout.session.completed

# Test subscription creation
npm run stripe:test-webhooks customer.subscription.created
```

Check Convex logs to verify:
```bash
npx convex logs
```

---

## Step 4: Test Payment Flows

### 4a. Start Development Server
```bash
npm run dev
```

### 4b. Test Membership Purchase
1. Go to: http://localhost:3000/membership
2. Select a membership plan
3. Complete checkout (use Stripe test card: `4242 4242 4242 4242`)
4. Verify membership is created in database

### 4c. Test Marketplace Checkout
1. Go to: http://localhost:3000/marketplace
2. Add items to cart
3. Complete checkout
4. Verify order is created

### 4d. Test Trainer Booking
1. Go to: http://localhost:3000/trainer-booking
2. Book a session
3. Complete payment
4. Verify booking is created

---

## Step 5: Verify Everything Works

### Checklist:
- [ ] Convex initialized and deployed
- [ ] Convex URL in `.env.local`
- [ ] Stripe webhook configured
- [ ] Webhook secret in `.env.local`
- [ ] Test webhook delivery successful
- [ ] Membership purchase works
- [ ] Marketplace checkout works
- [ ] Trainer booking payment works

---

## Quick Commands Reference

```bash
# Initialize Convex (one-time)
npx convex dev --once

# Get Convex URL
node scripts/get-convex-url.js

# Configure webhooks
npm run stripe:configure-webhooks

# Test webhooks
npm run stripe:test-webhooks checkout.session.completed

# View Convex logs
npx convex logs

# Start dev server
npm run dev
```

---

## Troubleshooting

### "Convex not initialized"
- Run: `npx convex dev --once`
- Make sure you're logged into Convex (it will prompt you)

### "Webhook not receiving events"
- Verify webhook URL is correct
- Check webhook secret matches in `.env.local`
- Ensure Convex deployment is running
- Check Convex logs: `npx convex logs`

### "Payment not processing"
- Verify Stripe keys are in `.env.local`
- Check product IDs are correct in `convex/memberships.ts`
- Verify webhook is configured and receiving events

---

## Need Help?

- Convex Docs: https://docs.convex.dev
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Check logs: `npx convex logs`

