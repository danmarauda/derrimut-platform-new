# Environment Variables Recovery Guide

**Date:** 2025-01-09
**Issue:** Sentry Vercel integration removed all non-Sentry environment variables
**Status:** ✅ PARTIALLY RECOVERED - Action required

---

## 🟢 Variables Successfully Restored

### ✅ Clerk Authentication (Test Keys)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YnVzeS1jb3ctNjIuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_78PTOTYIbA9LTDstbvsKvgEu3H3nQcoFbNGMs9erOP
```
**Status:** Restored to `.env.local`

### ✅ Convex Backend
```bash
CONVEX_DEPLOYMENT=dev:enchanted-salamander-914
NEXT_PUBLIC_CONVEX_URL=https://enchanted-salamander-914.convex.cloud
```
**Status:** Restored to `.env.local`

### ✅ Sentry (from integration)
```bash
NEXT_PUBLIC_SENTRY_DSN=https://466c34652f28d8cedaa6d82177335b3c@o4510005143470080.ingest.us.sentry.io/4510331315421184
SENTRY_AUTH_TOKEN=8436472c24a6ecc0f592c110c31c6199daaf6012566d315cb49bd2420d3bdeaf
SENTRY_ORG=araps
SENTRY_PROJECT=derrimut-platform
```
**Status:** Already in `.env.local`

---

## 🟡 Variables Requiring Action

### ⚠️ Stripe Payment Keys

**Status:** Exist in Vercel Production, but NOT in Development environment

**What you need to do:**

#### Option 1: Add Development/Test Stripe Keys (RECOMMENDED)
```bash
# Get test keys from: https://dashboard.stripe.com/test/apikeys

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY development
# Enter your test publishable key: pk_test_...

vercel env add STRIPE_SECRET_KEY development
# Enter your test secret key: sk_test_...

vercel env add STRIPE_WEBHOOK_SECRET development
# Enter your test webhook secret: whsec_...

# Pull to local
vercel env pull .env.local
```

#### Option 2: Copy from Production (NOT RECOMMENDED for development)
```bash
# Only if you want to use production keys locally (risky!)
vercel env pull .env.production --environment=production

# Then manually copy the Stripe keys to .env.local
```

---

### ⚠️ Vapi Voice AI Keys

**Status:** Unknown if you were using Vapi

**What you need to do:**

If you were using Vapi voice features:
```bash
# Get keys from: https://vapi.ai/dashboard

vercel env add NEXT_PUBLIC_VAPI_API_KEY development
# Enter your Vapi API key

vercel env add NEXT_PUBLIC_VAPI_WORKFLOW_ID development
# Enter your workflow ID

# Pull to local
vercel env pull .env.local
```

If NOT using Vapi, you can remove these lines from `.env.local`:
```bash
# Delete these lines if not using Vapi:
NEXT_PUBLIC_VAPI_API_KEY=
NEXT_PUBLIC_VAPI_WORKFLOW_ID=
```

---

## 🔧 Fix Vercel Production Environment Variables

The Sentry integration also removed variables from ALL environments (Development, Preview, Production).

### Restore to Development Environment

```bash
# Clerk (Test Keys)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY development
# Value: pk_test_YnVzeS1jb3ctNjIuY2xlcmsuYWNjb3VudHMuZGV2JA

vercel env add CLERK_SECRET_KEY development
# Value: sk_test_78PTOTYIbA9LTDstbvsKvgEu3H3nQcoFbNGMs9erOP

# Convex
vercel env add NEXT_PUBLIC_CONVEX_URL development
# Value: https://enchanted-salamander-914.convex.cloud

vercel env add CONVEX_DEPLOYMENT development
# Value: dev:enchanted-salamander-914

# Stripe (get test keys from Stripe dashboard)
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY development
vercel env add STRIPE_SECRET_KEY development
vercel env add STRIPE_WEBHOOK_SECRET development
```

### Restore to Preview Environment

Repeat the same commands but replace `development` with `preview`:

```bash
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY preview
vercel env add CLERK_SECRET_KEY preview
# ... etc for all variables
```

### Check Production Environment

```bash
# List all production env vars
vercel env ls | grep Production

# If any are missing, add them:
vercel env add <VARIABLE_NAME> production
```

---

## ✅ Verification Steps

### 1. Check Local Environment
```bash
cat .env.local
```

Should contain:
- ✅ Clerk keys (test)
- ✅ Convex URL and deployment
- ✅ Sentry DSN and auth token
- ⚠️ Stripe keys (add if using payments)
- ⚠️ Vapi keys (add if using voice)

### 2. Test Development Server
```bash
npm run dev
```

Expected:
- ✅ No Clerk errors
- ✅ No Convex connection errors
- ⚠️ Stripe errors if keys missing
- ⚠️ Vapi errors if keys missing

### 3. Test Authentication
1. Visit: http://localhost:3000/sign-in
2. Should see Clerk sign-in form
3. Try signing in
4. Should work without errors

### 4. Test Database
1. Visit any page that loads data
2. Check browser console for errors
3. Should connect to Convex without issues

---

## 🚨 Production Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables restored in Vercel dashboard
- [ ] Production uses PRODUCTION Clerk keys (not test keys)
- [ ] Production uses PRODUCTION Stripe keys (not test keys)
- [ ] Convex production deployment configured
- [ ] Sentry working correctly
- [ ] Test deployment in Preview environment first

---

## 📋 Current `.env.local` Status

```bash
# ✅ CONFIGURED
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CONVEX_DEPLOYMENT
NEXT_PUBLIC_CONVEX_URL
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT

# ⚠️ NEEDS CONFIGURATION
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (empty)
STRIPE_SECRET_KEY (empty)
STRIPE_WEBHOOK_SECRET (empty)
NEXT_PUBLIC_VAPI_API_KEY (empty)
NEXT_PUBLIC_VAPI_WORKFLOW_ID (empty)
```

---

## 🔐 Where to Get Missing Keys

### Stripe (Test Keys)
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy "Publishable key" → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Click "Reveal" on "Secret key" → `STRIPE_SECRET_KEY`
4. For webhook secret:
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Create/view webhook endpoint
   - Copy "Signing secret" → `STRIPE_WEBHOOK_SECRET`

### Vapi (if using)
1. Go to: https://vapi.ai/dashboard
2. Get API key → `NEXT_PUBLIC_VAPI_API_KEY`
3. Get workflow ID → `NEXT_PUBLIC_VAPI_WORKFLOW_ID`

---

## 🛡️ Prevention for Future

### Backup Environment Variables
```bash
# Create backup before any integration changes
vercel env pull .env.backup

# Or manually:
cp .env.local .env.local.backup
```

### Use Manual Sentry Setup Instead
```bash
# Uninstall Vercel native integration:
vercel integration remove sentry

# Install Sentry SDK manually:
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Manual setup will:**
- ✅ Keep all existing environment variables
- ✅ Only add Sentry-specific variables
- ✅ Not interfere with other services

---

## 📞 Support

If you need help:
1. Check Vercel dashboard for environment variables
2. Check Clerk dashboard for authentication keys
3. Check Stripe dashboard for payment keys
4. Contact support if keys are lost

---

*Last Updated: 2025-01-09*
*Next Action: Add Stripe test keys to development environment*
