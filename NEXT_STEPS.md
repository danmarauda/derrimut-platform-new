# ✅ Next Steps Summary

## Current Status

✅ **Completed:**
- All 4 Stripe products created successfully
- Product IDs updated in code
- Currency changed from LKR to AUD
- Membership types updated to Derrimut plans
- Webhook handlers consolidated

⏳ **Next Steps:**

## Step 1: Initialize Convex (Do This First)

**Run this command in your terminal:**
```bash
npx convex dev --once
```

**What happens:**
- Convex will prompt you to login/create account
- It will create `convex.json` with deployment info
- It will show your deployment URL (like `https://xxx.convex.site`)

**After it completes:**
- Copy the deployment URL
- Add it to `.env.local` as `NEXT_PUBLIC_CONVEX_URL`

## Step 2: Configure Webhooks

**After Step 1, run:**
```bash
npm run stripe:configure-webhooks
```

This will show you:
- Your webhook URL: `https://your-deployment.convex.site/stripe-webhook`
- Instructions for Stripe Dashboard setup

**Then:**
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint with your webhook URL
3. Select events (script will list them)
4. Copy webhook secret to `.env.local`

## Step 3: Test Everything

```bash
# Test webhook delivery
npm run stripe:test-webhooks checkout.session.completed

# Check Convex logs
npx convex logs

# Start dev server
npm run dev
```

## Quick Reference

**All commands:**
```bash
# Initialize Convex (interactive - run manually)
npx convex dev --once

# Get Convex URL (after initialization)
node scripts/get-convex-url.js

# Configure webhooks
npm run stripe:configure-webhooks

# Test webhooks
npm run stripe:test-webhooks checkout.session.completed

# View logs
npx convex logs
```

## Full Guide

See `NEXT_STEPS_GUIDE.md` for complete detailed instructions.

---

**Ready to start?** Run `npx convex dev --once` in your terminal!

