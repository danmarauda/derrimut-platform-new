# 🔐 Stripe Setup Guide - Production Configuration

This guide walks you through replacing placeholder Stripe IDs with your production Stripe product and price IDs.

## ⚠️ Critical: Placeholder IDs Must Be Replaced

The codebase currently contains **placeholder Stripe IDs** that must be replaced before deploying to production:

```typescript
// ❌ PLACEHOLDER IDs (DO NOT USE IN PRODUCTION)
stripePriceId: "price_1SRF1M4ghJnevp5XHk8AwEB0"
stripeProductId: "prod_TO13HhWD4id9gk"
```

## 📋 Prerequisites

1. **Stripe Account**: [Sign up at stripe.com](https://stripe.com)
2. **Stripe CLI** (optional but recommended): [Install Stripe CLI](https://stripe.com/docs/stripe-cli)
3. **Access to Convex Dashboard**: To update environment variables

## 🎯 Step 1: Create Stripe Products

### Option A: Using Stripe Dashboard (Recommended for beginners)

1. **Log in to Stripe Dashboard**: https://dashboard.stripe.com
2. **Navigate to Products**: Click "Products" in the left sidebar
3. **Create Products** for each membership type:

#### Product 1: 18-Month Minimum Membership
- **Name**: "18-Month Minimum Membership"
- **Description**: "Derrimut 24:7 Gym - 18-month commitment membership"
- **Pricing**:
  - **Type**: Recurring
  - **Billing Period**: Monthly
  - **Price**: $59.00 AUD (adjust to your pricing)
  - **Currency**: AUD
- **Save** and copy the **Price ID** (starts with `price_`)

#### Product 2: 12-Month Minimum Membership
- **Name**: "12-Month Minimum Membership"
- **Description**: "Derrimut 24:7 Gym - 12-month commitment membership"
- **Pricing**:
  - **Type**: Recurring
  - **Billing Period**: Monthly
  - **Price**: $69.00 AUD
  - **Currency**: AUD
- **Save** and copy the **Price ID**

#### Product 3: No Lock-In Membership
- **Name**: "No Lock-In Membership"
- **Description**: "Derrimut 24:7 Gym - Flexible month-to-month membership"
- **Pricing**:
  - **Type**: Recurring
  - **Billing Period**: Monthly
  - **Price**: $79.00 AUD
  - **Currency**: AUD
- **Save** and copy the **Price ID**

#### Product 4: 12-Month Upfront Membership
- **Name**: "12-Month Upfront Membership"
- **Description**: "Derrimut 24:7 Gym - Pay 12 months upfront"
- **Pricing**:
  - **Type**: One-time payment
  - **Price**: $708.00 AUD (12 × $59)
  - **Currency**: AUD
- **Save** and copy the **Price ID**

### Option B: Using Stripe CLI (Advanced)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Create products and prices
stripe products create \
  --name "18-Month Minimum Membership" \
  --description "Derrimut 24:7 Gym - 18-month commitment membership"

# Note the product ID (prod_xxx), then create price
stripe prices create \
  --product prod_xxx \
  --unit-amount 5900 \
  --currency aud \
  --recurring[interval]=month

# Repeat for other membership types
```

## 🔧 Step 2: Update Convex Functions

### File: `convex/memberships.ts`

Find and replace the following placeholder IDs:

**Lines 310, 322, 334, 346** - Update membership type configurations:

```typescript
// ❌ BEFORE (Placeholder IDs)
"18-month-minimum": {
  stripePriceId: "price_1SRF1M4ghJnevp5XHk8AwEB0", // TODO: Replace
  stripeProductId: "prod_TO13HhWD4id9gk",          // TODO: Replace
  name: "18-Month Minimum",
  price: 59,
  duration: 18,
  features: [...]
},

// ✅ AFTER (Your Production IDs)
"18-month-minimum": {
  stripePriceId: "price_YOUR_ACTUAL_PRICE_ID_HERE",
  stripeProductId: "prod_YOUR_ACTUAL_PRODUCT_ID_HERE",
  name: "18-Month Minimum",
  price: 59,
  duration: 18,
  features: [...]
},
```

**Repeat for all 4 membership types:**
1. `18-month-minimum` (line 310)
2. `12-month-minimum` (line 322)
3. `no-lock-in` (line 334)
4. `12-month-upfront` (line 346)

### File: `convex/http.ts` (Line 432)

Update the product ID mapping fallback:

```typescript
// ❌ BEFORE
const productIdToMembershipType: Record<string, string> = {
  "prod_TO13HhWD4id9gk": "18-month-minimum", // TODO: Update
  // Add other product IDs
};

// ✅ AFTER
const productIdToMembershipType: Record<string, string> = {
  "prod_YOUR_18_MONTH_PRODUCT_ID": "18-month-minimum",
  "prod_YOUR_12_MONTH_PRODUCT_ID": "12-month-minimum",
  "prod_YOUR_NO_LOCK_IN_PRODUCT_ID": "no-lock-in",
  "prod_YOUR_12_MONTH_UPFRONT_PRODUCT_ID": "12-month-upfront",
};
```

## 🔐 Step 3: Update Environment Variables

### Development (.env.local)

```bash
# Stripe Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Production (Vercel/Convex)

1. **Vercel Dashboard**:
   - Go to Project Settings > Environment Variables
   - Add production Stripe keys:
     ```
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
     STRIPE_SECRET_KEY=sk_live_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```

2. **Convex Dashboard**:
   - Go to Settings > Environment Variables
   - Add the same production keys

## 🧪 Step 4: Test the Integration

### Test Mode (Development)

1. **Use Stripe Test Cards**:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - [More test cards](https://stripe.com/docs/testing)

2. **Test Membership Purchase**:
   ```bash
   # Start development server
   bun run dev
   
   # Navigate to /membership
   # Select a membership plan
   # Use test card to complete purchase
   # Verify webhook receives event
   # Check Convex database for membership record
   ```

3. **Verify Webhook**:
   ```bash
   # Forward webhooks to local development
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   
   # Test webhook
   stripe trigger checkout.session.completed
   ```

### Production Testing

1. **Enable Stripe Test Mode in Production** (temporarily)
2. **Complete a test purchase**
3. **Verify in Stripe Dashboard** > Payments
4. **Check Convex database** for membership record
5. **Switch to Live Mode** when ready

## ✅ Step 5: Verification Checklist

Before going live, verify:

- [ ] All 4 membership products created in Stripe
- [ ] All 4 price IDs copied and updated in `convex/memberships.ts`
- [ ] Product ID mapping updated in `convex/http.ts`
- [ ] Environment variables updated in Vercel
- [ ] Environment variables updated in Convex
- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] Test purchase completed successfully
- [ ] Webhook events received and processed
- [ ] Membership record created in database
- [ ] No placeholder IDs remain in codebase

## 🔍 Finding Placeholder IDs

Run this command to find any remaining placeholder IDs:

```bash
# Search for placeholder Stripe IDs
grep -r "price_1SRF1M4ghJnevp5XHk8AwEB0\|prod_TO13HhWD4id9gk" convex/ src/

# Should return no results when all are replaced
```

## 📚 Additional Resources

- [Stripe Products Documentation](https://stripe.com/docs/products-prices/overview)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Convex Environment Variables](https://docs.convex.dev/production/environment-variables)

## 🆘 Troubleshooting

### Issue: Webhook not receiving events

**Solution**:
1. Verify webhook endpoint URL in Stripe Dashboard
2. Check webhook secret matches environment variable
3. Ensure webhook is listening for correct events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`

### Issue: Payment succeeds but membership not created

**Solution**:
1. Check Convex logs for errors
2. Verify product ID mapping in `convex/http.ts`
3. Ensure webhook signature verification passes
4. Check database permissions

### Issue: Wrong membership type assigned

**Solution**:
1. Verify price ID matches membership type
2. Check product ID mapping
3. Review webhook metadata

## 📞 Support

If you encounter issues:
1. Check Stripe Dashboard > Developers > Logs
2. Check Convex Dashboard > Logs
3. Review Vercel deployment logs
4. Contact Stripe Support: https://support.stripe.com

---

**Last Updated**: 2025-01-11  
**Version**: 1.0  
**Maintained By**: Derrimut Platform Team

