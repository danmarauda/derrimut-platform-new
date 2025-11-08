# 🔧 Environment Setup Status

## ✅ Current Configuration Status

### Convex Dev Deployment (`enchanted-salamander-914`)
- ✅ `STRIPE_SECRET_KEY` - Set
- ✅ `STRIPE_WEBHOOK_SECRET` - Set
- ⚠️  `CLERK_WEBHOOK_SECRET` - Optional (used for Clerk webhooks)
- ⚠️  `GEMINI_API_KEY` - Optional (used for AI plan generation)

### Convex Prod Deployment (`spotted-gerbil-236`)
- ✅ `STRIPE_SECRET_KEY` - Set
- ✅ `STRIPE_WEBHOOK_SECRET` - Set
- ⚠️  `CLERK_WEBHOOK_SECRET` - Optional (used for Clerk webhooks)
- ⚠️  `GEMINI_API_KEY` - Optional (used for AI plan generation)

### Vercel Production (`derrimut.aliaslabs.ai`)
- ✅ `STRIPE_SECRET_KEY` - Set
- ✅ `STRIPE_WEBHOOK_SECRET` - Set
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Set
- ✅ `CLERK_SECRET_KEY` - Set
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Set
- ✅ `CONVEX_DEPLOYMENT` - Set (`spotted-gerbil-236`)
- ✅ `NEXT_PUBLIC_CONVEX_URL` - Set (`https://spotted-gerbil-236.convex.cloud`)
- ✅ `NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT` - Set

## 📋 Required vs Optional Variables

### Required (Critical for Core Functionality)
1. **Stripe Integration**
   - `STRIPE_SECRET_KEY` - ✅ Set in all environments
   - `STRIPE_WEBHOOK_SECRET` - ✅ Set in all environments
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - ✅ Set in Vercel

2. **Clerk Authentication**
   - `CLERK_SECRET_KEY` - ✅ Set in Vercel
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - ✅ Set in Vercel
   - `CLERK_WEBHOOK_SECRET` - ⚠️ Optional (only needed if using Clerk webhooks)

3. **Convex Backend**
   - `NEXT_PUBLIC_CONVEX_URL` - ✅ Set in Vercel
   - `CONVEX_DEPLOYMENT` - ✅ Set in Vercel

### Optional (Feature-Specific)
1. **AI Plan Generation**
   - `GEMINI_API_KEY` - ⚠️ Optional (only needed for `/generate-program` page)

2. **Analytics**
   - `NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT` - ✅ Set in Vercel

## 🔍 How to Verify

### Check Convex Environment Variables
```bash
# Dev deployment
bunx convex env list

# Prod deployment
bunx convex env list --prod
```

### Check Vercel Environment Variables
```bash
vercel env ls
```

### View in Dashboards
- **Convex Dev:** https://dashboard.convex.dev/d/enchanted-salamander-914
- **Convex Prod:** https://dashboard.convex.dev/d/spotted-gerbil-236
- **Vercel:** https://vercel.com/alias-labs/derrimut-platform/settings/environment-variables

## 🚀 Setting Missing Variables

### If CLERK_WEBHOOK_SECRET is needed:
```bash
# Get from Clerk Dashboard > Webhooks > Signing Secret
# Then set in Convex:
bunx convex env set CLERK_WEBHOOK_SECRET "whsec_..." 
bunx convex env set CLERK_WEBHOOK_SECRET "whsec_..." --prod
```

### If GEMINI_API_KEY is needed:
```bash
# Get from Google AI Studio: https://aistudio.google.com/app/apikey
# Then set in Convex:
bunx convex env set GEMINI_API_KEY "your_key_here"
bunx convex env set GEMINI_API_KEY "your_key_here" --prod
```

### Automated Setup (from .env.local)
```bash
# Set all variables from .env.local to both dev and prod
bun run convex:set-env-all
```

## ✅ Verification Checklist

### Core Functionality
- [x] Stripe payments work
- [x] Clerk authentication works
- [x] Convex backend connected
- [x] Webhooks configured

### Optional Features
- [ ] AI plan generation (requires GEMINI_API_KEY)
- [ ] Clerk webhooks (requires CLERK_WEBHOOK_SECRET)

## 📝 Notes

1. **Environment Separation:**
   - Dev Convex: `enchanted-salamander-914` (for local development)
   - Prod Convex: `spotted-gerbil-236` (for production)
   - Vercel: Uses production Convex URL

2. **Stripe Keys:**
   - Currently using **test keys** (`sk_test_...`)
   - For production, switch to **live keys** (`sk_live_...`)

3. **Clerk Keys:**
   - Production keys are configured
   - Localhost testing requires adding `http://localhost:3000` to Clerk allowed origins

4. **Webhook URLs:**
   - Stripe: `https://spotted-gerbil-236.convex.site/stripe-webhook` (prod)
   - Clerk: `https://spotted-gerbil-236.convex.site/clerk-webhook` (prod)

## 🎯 Summary

**Status: ✅ Core functionality is fully configured**

All critical environment variables are set for both dev and prod environments. Optional variables (CLERK_WEBHOOK_SECRET, GEMINI_API_KEY) can be added when needed for specific features.

