# ✅ CLI Scripts Created for Stripe Setup

## 📦 Created Scripts

All scripts are in the `scripts/` directory:

1. **`create-stripe-products.js`** - Creates all 4 Derrimut membership products in Stripe
2. **`update-product-ids.js`** - Updates `convex/memberships.ts` with actual product IDs
3. **`configure-webhooks.js`** - Shows webhook configuration instructions
4. **`test-webhooks.js`** - Tests webhook delivery
5. **`setup-stripe.js`** - Runs all steps in sequence

## 🚀 Quick Start

### Option 1: One-Command Setup (Recommended)
```bash
npm run stripe:setup
```

### Option 2: Step-by-Step
```bash
# Step 1: Create products
npm run stripe:create-products

# Step 2: Update code
npm run stripe:update-ids

# Step 3: Configure webhooks
npm run stripe:configure-webhooks

# Step 4: Test
npm run stripe:test-webhooks checkout.session.completed
```

## 📋 Prerequisites

Before running scripts:

1. **Install Stripe CLI**
   ```bash
   brew install stripe/stripe-cli/stripe  # macOS
   # Or: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Environment Variables** (`.env.local`)
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.site
   ```

## 📚 Documentation

- **Quick Start:** `STRIPE_QUICKSTART.md`
- **Full Guide:** `STRIPE_SETUP_CLI.md`

## ✅ What the Scripts Do

### `create-stripe-products.js`
- Creates 4 products in Stripe:
  - 18 Month Minimum ($14.95/fortnight)
  - 12 Month Minimum ($17.95/fortnight)
  - No Lock-in ($19.95/fortnight)
  - 12 Month Upfront ($749 one-time)
- Creates prices for each product
- Saves product IDs to `stripe-products-created.json`

### `update-product-ids.js`
- Reads `stripe-products-created.json`
- Updates `convex/memberships.ts` with actual Stripe IDs
- Replaces placeholder IDs (`prod_DERRIMUT_*`) with real IDs

### `configure-webhooks.js`
- Shows webhook URL for your Convex deployment
- Provides instructions for Stripe Dashboard setup
- Shows Stripe CLI command for testing

### `test-webhooks.js`
- Triggers test webhook events
- Verifies webhook delivery to Convex
- Shows how to check Convex logs

## 🎯 Next Steps After Running Scripts

1. **Configure Webhook in Stripe Dashboard**
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://your-deployment.convex.site/stripe-webhook`
   - Select events (see `STRIPE_SETUP_CLI.md`)
   - Copy webhook secret to `.env.local`

2. **Test Payment Flows**
   - Test membership purchase
   - Test marketplace checkout
   - Test trainer booking payment

3. **Monitor Logs**
   ```bash
   npx convex logs  # Check webhook events
   ```

## 🔧 Troubleshooting

See `STRIPE_SETUP_CLI.md` for troubleshooting guide.

## 📝 Notes

- Generated `stripe-products-created.json` is gitignored (contains product IDs)
- Scripts use Node.js (no additional dependencies needed)
- All scripts include error handling and helpful messages

