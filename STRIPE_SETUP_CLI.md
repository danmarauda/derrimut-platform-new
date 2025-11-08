# 🚀 Stripe Setup via CLI

Complete guide for setting up Stripe products and webhooks via command line.

## Prerequisites

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_*_linux_x86_64.tar.gz
   tar -xvf stripe_*_linux_x86_64.tar.gz
   sudo mv stripe /usr/local/bin
   
   # Windows (via Scoop)
   scoop install stripe
   ```

2. **Login to Stripe CLI**
   ```bash
   stripe login
   ```

3. **Verify Environment Variables**
   Make sure `.env.local` has:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.site
   ```

## Quick Setup (All Steps)

Run the complete setup script:

```bash
npm run stripe:setup
```

This will:
1. ✅ Create all 4 Derrimut membership products in Stripe
2. ✅ Update product IDs in `convex/memberships.ts`
3. ✅ Show webhook configuration instructions

## Step-by-Step Setup

### Step 1: Create Stripe Products

```bash
npm run stripe:create-products
```

This creates:
- 18 Month Minimum ($14.95/fortnight)
- 12 Month Minimum ($17.95/fortnight)
- No Lock-in Contract ($19.95/fortnight)
- 12 Month Upfront ($749 one-time)

**Output:** Product IDs saved to `stripe-products-created.json`

### Step 2: Update Product IDs in Code

```bash
npm run stripe:update-ids
```

This automatically updates `convex/memberships.ts` with the actual Stripe product and price IDs.

### Step 3: Configure Webhooks

```bash
npm run stripe:configure-webhooks
```

This shows instructions for configuring webhooks. Choose one:

**Option A: Stripe Dashboard (Production)**
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-deployment.convex.site/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy signing secret to `.env.local` as `STRIPE_WEBHOOK_SECRET`

**Option B: Stripe CLI (Testing)**
```bash
stripe listen --forward-to https://your-deployment.convex.site/stripe-webhook
```

This outputs a webhook secret. Add it to `.env.local`.

### Step 4: Test Webhooks

```bash
# Test checkout completion
npm run stripe:test-webhooks checkout.session.completed

# Test subscription creation
npm run stripe:test-webhooks customer.subscription.created

# Test payment success
npm run stripe:test-webhooks invoice.payment_succeeded
```

Check Convex logs to verify:
```bash
npx convex logs
```

## Manual Commands

If you prefer to run scripts directly:

```bash
# Create products
node scripts/create-stripe-products.js

# Update IDs
node scripts/update-product-ids.js

# Configure webhooks
node scripts/configure-webhooks.js

# Test webhooks
node scripts/test-webhooks.js checkout.session.completed
```

## Verification Checklist

After setup, verify:

- [ ] Products created in Stripe Dashboard
- [ ] Product IDs updated in `convex/memberships.ts`
- [ ] Webhook endpoint configured in Stripe
- [ ] `STRIPE_WEBHOOK_SECRET` added to `.env.local`
- [ ] Test webhook delivery successful
- [ ] Convex logs show webhook events

## Troubleshooting

### "Stripe CLI not found"
```bash
# Install Stripe CLI (see Prerequisites above)
stripe --version  # Verify installation
```

### "Invalid API Key"
- Check `STRIPE_SECRET_KEY` in `.env.local`
- Make sure it starts with `sk_test_` (test) or `sk_live_` (production)
- Verify key is active in Stripe Dashboard

### "Convex URL not found"
- Check `NEXT_PUBLIC_CONVEX_URL` in `.env.local`
- Format: `https://deployment-name.convex.site`
- Get URL from Convex Dashboard

### "Webhook not receiving events"
- Verify webhook URL is correct
- Check webhook secret matches in `.env.local`
- Ensure Convex deployment is running
- Check Convex logs: `npx convex logs`

## Next Steps

After setup:
1. Test membership purchase flow
2. Test marketplace checkout
3. Test trainer booking payment
4. Monitor webhook logs in Convex Dashboard

## Support

- Stripe CLI Docs: https://stripe.com/docs/stripe-cli
- Convex HTTP Routes: https://docs.convex.dev/functions/http-actions
- Stripe Webhooks: https://stripe.com/docs/webhooks

