# Environment Variables Guide - Derrimut Platform

## Required Environment Variables

This document outlines all environment variables required for the Derrimut 24:7 Gym Platform.

**Status:** Updated with validation (Task 1.6)

---

## Core Services

### Convex (Real-time Database)

```bash
# Convex URL (get from Convex dashboard)
NEXT_PUBLIC_CONVEX_URL=https://enchanted-salamander-914.convex.cloud

# Convex deployment name
CONVEX_DEPLOYMENT=dev:enchanted-salamander-914
# OR for production:
# CONVEX_DEPLOYMENT=prod:spotted-gerbil-236
```

**How to get:**
1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Copy the deployment URL

---

### Clerk (Authentication)

```bash
# Clerk publishable key (client-side)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
# OR for production:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...

# Clerk secret key (server-side)
CLERK_SECRET_KEY=sk_test_...
# OR for production:
# CLERK_SECRET_KEY=sk_live_...

# Clerk webhook secret (for user sync)
CLERK_WEBHOOK_SECRET=whsec_...
```

**How to get:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to "API Keys" section
4. Copy publishable and secret keys
5. For webhook secret: Go to "Webhooks" → Create endpoint → Copy signing secret

---

### Stripe (Payments)

```bash
# Stripe publishable key (client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# OR for production:
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Stripe secret key (server-side)
STRIPE_SECRET_KEY=sk_test_...
# OR for production:
# STRIPE_SECRET_KEY=sk_live_...

# Stripe webhook secret
STRIPE_WEBHOOK_SECRET=whsec_...
```

**How to get:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to "Developers" → "API keys"
3. Copy publishable and secret keys
4. For webhook secret:
   - Go to "Webhooks"
   - Add endpoint: `https://your-domain.convex.site/stripe-webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`
   - Copy signing secret

---

### Vapi (Voice AI)

```bash
# Vapi API key
NEXT_PUBLIC_VAPI_API_KEY=your-vapi-api-key

# Vapi workflow ID (UUID)
NEXT_PUBLIC_VAPI_WORKFLOW_ID=e13b1b19-3cd5-42ab-ba5d-7c46bf989a6e
```

**How to get:**
1. Go to [Vapi Dashboard](https://dashboard.vapi.ai)
2. Navigate to "API Keys"
3. Create new API key
4. For workflow ID:
   - Go to "Workflows"
   - Create or select existing workflow
   - Copy the workflow UUID

---

### Google Gemini AI

```bash
# Gemini API key
GEMINI_API_KEY=AIza...
```

**How to get:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create new key or use existing
4. Copy the API key

---

## Optional Services

### Sentry (Error Tracking)

```bash
# Sentry DSN (Data Source Name)
NEXT_PUBLIC_SENTRY_DSN=https://...@o...ingest.sentry.io/...

# Sentry organization (for source maps upload)
SENTRY_ORG=your-org-name

# Sentry project
SENTRY_PROJECT=derrimut-platform

# Sentry auth token (for CI/CD)
SENTRY_AUTH_TOKEN=sntrys_...
```

**How to get:**
1. Go to [Sentry Dashboard](https://sentry.io)
2. Create new project or select existing
3. Go to "Settings" → "Client Keys (DSN)"
4. Copy the DSN
5. For auth token: "Settings" → "Auth Tokens" → Create token

---

### CSRF Protection

```bash
# CSRF secret (generate random string)
CSRF_SECRET=your-random-secret-string-here
```

**How to generate:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

---

## Environment-Specific Setup

### Development (.env.local)

```bash
# Copy from .env.example
cp .env.example .env.local

# Add your development keys
# Use test/development keys for all services
```

### Staging (.env.staging)

```bash
# Use test keys but with production-like data
# Test webhooks against staging domain
```

### Production (.env.production)

```bash
# Use LIVE keys for all services
# Ensure all secrets are rotated from development
# Use production Convex deployment
# Enable Sentry error tracking
```

---

## Validation

The platform automatically validates all environment variables on startup using Zod schemas.

**If validation fails:**
1. Check console for specific error messages
2. Ensure all required variables are set
3. Verify variable formats (e.g., URLs must be valid, Stripe keys must start with correct prefix)
4. See error messages for specific requirements

**Validation errors prevent:**
- Development server from starting
- Production builds from succeeding
- Runtime errors from missing configuration

---

## Security Best Practices

1. **Never commit .env files** - They're in .gitignore
2. **Rotate secrets regularly** - Especially after team changes
3. **Use different keys per environment** - Don't share dev/prod keys
4. **Limit key permissions** - Use restricted API keys when possible
5. **Monitor key usage** - Check for unauthorized access

---

## Vercel Deployment

To set environment variables in Vercel:

```bash
# Using Vercel CLI
vercel env add NEXT_PUBLIC_CONVEX_URL production
# Paste value when prompted

# Or use the dashboard
# 1. Go to project settings
# 2. Navigate to "Environment Variables"
# 3. Add each variable with appropriate scope
```

**Important for Vercel:**
- `NEXT_PUBLIC_*` variables are exposed to the client
- Server-only variables (like secrets) should NOT have `NEXT_PUBLIC_` prefix
- Set variables for appropriate environments (Development, Preview, Production)

---

## Troubleshooting

### "Environment validation failed"
- Check that all required variables are set
- Verify variable formats match requirements
- Look at specific error messages in console

### "Missing CONVEX_DEPLOYMENT"
- Set in your .env.local file
- Format: `dev:your-deployment-name` or `prod:your-deployment-name`

### "Invalid Stripe key format"
- Ensure keys start with correct prefix (`pk_`, `sk_`, `whsec_`)
- Check for extra spaces or newlines
- Verify you're using the correct environment keys

### "GEMINI_API_KEY is required"
- Create API key at Google AI Studio
- Add to .env.local
- Restart development server

---

## Quick Start Checklist

- [ ] Copy `.env.example` to `.env.local`
- [ ] Add Convex URL and deployment
- [ ] Add Clerk keys (publishable + secret)
- [ ] Add Stripe keys (publishable + secret + webhook)
- [ ] Add Vapi keys (API key + workflow ID)
- [ ] Add Gemini API key
- [ ] (Optional) Add Sentry DSN
- [ ] (Optional) Generate CSRF secret
- [ ] Run `npm run dev` to validate
- [ ] Check console for validation success

---

**Last Updated:** January 9, 2025
**Task:** 1.6 - Environment Variable Validation
