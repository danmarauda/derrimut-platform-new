# 🧠 Stripe + Convex Integration Memories

## Critical Learnings

### 1. Convex Environment Variables Are Separate
**Memory:** Convex functions run in a completely separate environment from Next.js. They cannot access `.env.local` files. All environment variables must be set explicitly in the Convex Dashboard or via CLI.

**Pattern:**
```typescript
// Always validate before use
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("Missing API_KEY. Set it in Convex dashboard.");
}
```

### 2. Dev and Prod Are Separate Deployments
**Memory:** Convex has separate dev and prod deployments. Environment variables must be set for each deployment separately using the `--prod` flag.

**Commands:**
```bash
# Dev (default)
bunx convex env set VAR "value"

# Prod (explicit)
bunx convex env set VAR "value" --prod
```

### 3. Webhook Secrets Are Per-Endpoint
**Memory:** Each Stripe webhook endpoint has its own unique signing secret. Dev and prod webhooks will have different secrets. Always use the correct secret for the environment.

### 4. Stripe Initialization Must Validate
**Memory:** Never initialize Stripe without checking if the secret key exists. Always provide clear error messages that guide developers to fix the issue.

**Error Pattern:**
```typescript
if (!stripeSecretKey) {
  console.error("❌ Missing STRIPE_SECRET_KEY");
  console.error("💡 Set it in Convex dashboard: Settings > Environment Variables");
  throw new Error("Missing STRIPE_SECRET_KEY. Set it in Convex dashboard.");
}
```

### 5. Setup Workflow Order Matters
**Memory:** The setup workflow must follow this order:
1. Create Stripe products/prices
2. Update code with product IDs
3. Configure webhooks in Stripe Dashboard
4. Set Convex environment variables (dev and prod)
5. Test webhooks

### 6. Testing Requires Both Environments
**Memory:** Always test in both dev and prod. Use test keys (`sk_test_...`) for dev and live keys (`sk_live_...`) for prod.

## Automation Scripts Created

### Setup Scripts
- `bun run stripe:setup-full` - Complete automated setup (dev)
- `bun run stripe:setup-prod` - Complete automated setup (prod)
- `bun run convex:set-env` - Copy env vars from .env.local to Convex

### Test Scripts
- `bun run stripe:test` - Test integration (dev)
- `bun run stripe:test-prod` - Test integration (prod)

## Common Issues & Solutions

### Issue: "Neither apiKey nor config.authenticator provided"
**Cause:** `STRIPE_SECRET_KEY` not set in Convex
**Solution:** `bunx convex env set STRIPE_SECRET_KEY "sk_test_..."`

### Issue: "Webhook signature verification failed"
**Cause:** Wrong webhook secret or secret not set
**Solution:** Get correct secret from Stripe Dashboard and set it

### Issue: Works in dev, fails in prod
**Cause:** Environment variables not set for prod
**Solution:** Set variables with `--prod` flag

## Best Practices Established

1. **Always validate environment variables** before using them
2. **Set variables for both dev and prod** deployments
3. **Use clear error messages** that guide developers
4. **Automate setup** with scripts to reduce errors
5. **Test both environments** before deploying
6. **Document the workflow** for future reference

## File Locations

- **Rules:** `STRIPE_CONVEX_RULES.md` - Complete guide and best practices
- **Setup Script:** `scripts/setup-stripe-convex.js` - Automated setup
- **Test Script:** `scripts/test-stripe-convex.js` - Integration testing
- **Env Script:** `scripts/set-convex-env.js` - Copy env vars to Convex

## Quick Reference

```bash
# Complete setup (dev)
bun run stripe:setup-full

# Complete setup (prod)
bun run stripe:setup-prod

# Test integration
bun run stripe:test

# Set env vars manually
bunx convex env set VAR "value" [--prod]

# Check env vars
bunx convex env list [--prod]
```

---

**Remember:** Convex functions cannot access `.env.local` - always set variables explicitly!

