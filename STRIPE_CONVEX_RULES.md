# 🎯 Stripe + Convex Integration Rules & Best Practices

## 📚 Key Learnings & Memories

### Critical Rule #1: Convex Environment Variables
**NEVER assume `.env.local` is available in Convex functions!**

- ❌ **Wrong:** `const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);`
- ✅ **Right:** 
  ```typescript
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY. Set it in Convex dashboard.");
  }
  const stripe = require("stripe")(stripeSecretKey);
  ```

**Why:** Convex functions run in a separate environment and cannot access `.env.local`. All environment variables must be set in the Convex Dashboard or via CLI.

### Critical Rule #2: Always Set Variables on Both Deployments
**Always configure DEV and PROD separately!**

```bash
# DEV (default)
bunx convex env set STRIPE_SECRET_KEY "sk_test_..." 

# PROD (explicit)
bunx convex env set STRIPE_SECRET_KEY "sk_live_..." --prod
```

**Why:** Dev and prod are separate deployments with separate configurations.

### Critical Rule #3: Webhook Secrets Are Different Per Environment
**Each Stripe webhook endpoint has its own signing secret!**

- Dev webhook URL → Dev webhook secret (`whsec_...`)
- Prod webhook URL → Prod webhook secret (`whsec_...`)

**Why:** Stripe generates unique signing secrets for each webhook endpoint.

### Critical Rule #4: Error Handling Pattern
**Always validate environment variables before use!**

```typescript
// Pattern to follow:
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("❌ Missing API_KEY environment variable");
  console.error("💡 Set it in Convex dashboard: Settings > Environment Variables");
  throw new Error("Missing API_KEY environment variable. Set it in Convex dashboard.");
}
```

**Why:** Provides clear error messages and guides developers to fix the issue.

## 🔧 Setup Workflow

### Step 1: Create Stripe Products & Prices
```bash
bun run stripe:create-products
```

**Output:** `stripe-products-created.json` with product and price IDs.

### Step 2: Update Code with Product IDs
```bash
bun run stripe:update-ids
```

**What it does:** Updates `convex/memberships.ts` with actual Stripe product/price IDs.

### Step 3: Configure Webhooks
```bash
bun run stripe:configure-webhooks
```

**What it does:** Shows webhook URL and instructions for Stripe Dashboard.

### Step 4: Set Convex Environment Variables
```bash
# Automated (from .env.local)
bun run convex:set-env

# Or manual (CLI)
bunx convex env set STRIPE_SECRET_KEY "sk_test_..." 
bunx convex env set STRIPE_SECRET_KEY "sk_test_..." --prod
bunx convex env set STRIPE_WEBHOOK_SECRET "whsec_..."
bunx convex env set STRIPE_WEBHOOK_SECRET "whsec_..." --prod
```

### Step 5: Test Webhooks
```bash
bun run stripe:test-webhooks
```

## 📋 Required Environment Variables

### For Convex Functions (Set via CLI/Dashboard)
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `CLERK_WEBHOOK_SECRET` - Clerk webhook secret (if using Clerk)
- `GEMINI_API_KEY` - Google Gemini API key (if using AI)

### For Next.js (Set in `.env.local`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe API secret key (for API routes)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (for API routes)
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key

## 🧪 Testing Checklist

### Pre-Deployment Checklist
- [ ] Stripe products created
- [ ] Product IDs updated in code
- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] Webhook secret copied from Stripe Dashboard
- [ ] Convex environment variables set (DEV)
- [ ] Convex environment variables set (PROD)
- [ ] Webhook tested with Stripe CLI

### Post-Deployment Checklist
- [ ] Webhook receives events (check Convex logs)
- [ ] Membership creation works
- [ ] Subscription updates work
- [ ] Payment processing works
- [ ] Error handling works

## 🚨 Common Pitfalls

### Pitfall #1: Forgetting to Set Convex Variables
**Symptom:** `Neither apiKey nor config.authenticator provided`
**Fix:** Set `STRIPE_SECRET_KEY` in Convex Dashboard/CLI

### Pitfall #2: Using Wrong Webhook Secret
**Symptom:** `Webhook signature verification failed`
**Fix:** Use the correct webhook secret for the environment (dev vs prod)

### Pitfall #3: Not Setting Prod Variables
**Symptom:** Works in dev, fails in prod
**Fix:** Always set variables with `--prod` flag

### Pitfall #4: Hardcoding Product IDs
**Symptom:** Products don't match Stripe
**Fix:** Use `stripe:update-ids` script after creating products

## 📝 Code Patterns

### Stripe Initialization Pattern
```typescript
// Always validate before initializing
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY. Set it in Convex dashboard.");
}
const stripe = require("stripe")(stripeSecretKey);
```

### Webhook Verification Pattern
```typescript
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET. Set it in Convex dashboard.");
}

// Verify signature
const event = await stripe.webhooks.constructEventAsync(
  body,
  signature,
  webhookSecret
);
```

### Error Logging Pattern
```typescript
try {
  // Stripe operation
} catch (error: any) {
  console.error(`❌ Stripe error: ${error.message}`);
  console.error(`📋 Error details:`, error);
  throw error;
}
```

## 🔄 Deployment Workflow

### Development
1. Create products: `bun run stripe:create-products`
2. Update IDs: `bun run stripe:update-ids`
3. Set dev vars: `bun run convex:set-env` (or manual)
4. Test: `bun run stripe:test-webhooks`

### Production
1. Create products in Stripe Dashboard (or use same test products)
2. Update IDs if needed: `bun run stripe:update-ids`
3. Set prod vars: `bunx convex env set VAR "value" --prod`
4. Configure prod webhook in Stripe Dashboard
5. Set prod webhook secret: `bunx convex env set STRIPE_WEBHOOK_SECRET "whsec_..." --prod`
6. Deploy: `bunx convex deploy`
7. Test prod webhook

## 🎯 Automation Scripts

### Available Scripts
- `bun run stripe:create-products` - Create Stripe products/prices
- `bun run stripe:update-ids` - Update code with product IDs
- `bun run stripe:configure-webhooks` - Show webhook setup instructions
- `bun run stripe:test-webhooks` - Test webhook locally
- `bun run stripe:setup` - Run all Stripe setup steps
- `bun run convex:set-env` - Copy env vars from .env.local to Convex

## 📊 Monitoring

### Check Convex Logs
```bash
bunx convex logs --history 50
```

### Check Stripe Events
- Stripe Dashboard → Developers → Events
- Filter by webhook endpoint

### Verify Environment Variables
```bash
# Dev
bunx convex env list

# Prod
bunx convex env list --prod
```

## 🔐 Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Use test keys for dev** - `sk_test_...` for development
3. **Use live keys for prod** - `sk_live_...` for production
4. **Rotate keys regularly** - Update Stripe keys periodically
5. **Verify webhook signatures** - Always verify Stripe webhook signatures
6. **Use HTTPS** - All webhook endpoints must use HTTPS
7. **Limit webhook access** - Use webhook signing secrets

## 📚 Reference Links

- [Convex Environment Variables](https://docs.convex.dev/production/environment-variables)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Convex CLI](https://docs.convex.dev/cli)

---

**Last Updated:** Based on Derrimut Platform setup experience
**Key Takeaway:** Always set Convex environment variables separately from `.env.local`!

