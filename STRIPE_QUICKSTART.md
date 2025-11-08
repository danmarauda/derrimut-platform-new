# Quick Start: Stripe Setup via CLI

## 🚀 One-Command Setup

```bash
npm run stripe:setup
```

This runs all steps automatically!

## 📋 Prerequisites

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Check Environment Variables**
   Your `.env.local` should have:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.site
   ```

## 🎯 Step-by-Step (if needed)

### 1. Create Products
```bash
npm run stripe:create-products
```
Creates 4 Derrimut membership products in Stripe.

### 2. Update Code
```bash
npm run stripe:update-ids
```
Updates `convex/memberships.ts` with actual product IDs.

### 3. Configure Webhooks
```bash
npm run stripe:configure-webhooks
```
Shows instructions for webhook setup.

### 4. Test
```bash
npm run stripe:test-webhooks checkout.session.completed
```
Tests webhook delivery.

## 📚 Full Documentation

See `STRIPE_SETUP_CLI.md` for complete guide.

