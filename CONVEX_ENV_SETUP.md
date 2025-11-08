# 🔧 Convex Environment Variables Setup

## ⚠️ Critical Issue Fixed

The Stripe webhook was failing because Convex functions **cannot access `.env.local`**. Environment variables must be set in the **Convex Dashboard**.

## ✅ What Was Fixed

1. ✅ Added error handling for missing `STRIPE_SECRET_KEY` in `convex/http.ts`
2. ✅ Added error handling for missing `STRIPE_SECRET_KEY` in `convex/memberships.ts` (all 4 locations)
3. ✅ Improved error messages to guide users to Convex dashboard

## 📋 Required Environment Variables

You need to set these in the **Convex Dashboard**:

### 1. Stripe Secret Key
- **Variable Name:** `STRIPE_SECRET_KEY`
- **Value:** Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
- **Get it from:** `.env.local` or Stripe Dashboard

### 2. Stripe Webhook Secret
- **Variable Name:** `STRIPE_WEBHOOK_SECRET`
- **Value:** Your Stripe webhook signing secret (starts with `whsec_`)
- **Get it from:** Stripe Dashboard > Webhooks > Your endpoint > Signing secret

### 3. Clerk Webhook Secret (if not already set)
- **Variable Name:** `CLERK_WEBHOOK_SECRET`
- **Value:** Your Clerk webhook secret
- **Get it from:** Clerk Dashboard > Webhooks

### 4. Google Gemini API Key (if not already set)
- **Variable Name:** `GEMINI_API_KEY`
- **Value:** Your Google Gemini API key
- **Get it from:** Google AI Studio

## 🚀 How to Set Environment Variables in Convex

### Method 1: Convex Dashboard (Recommended)

1. **Go to Convex Dashboard**
   - Visit: https://dashboard.convex.dev
   - Select your project: `enchanted-salamander-914`

2. **Navigate to Settings**
   - Click **Settings** in the left sidebar
   - Click **Environment Variables** tab

3. **Add Each Variable**
   - Click **Add Variable**
   - Enter variable name (e.g., `STRIPE_SECRET_KEY`)
   - Enter variable value
   - Click **Save**

4. **Repeat for All Variables**
   - Add `STRIPE_SECRET_KEY`
   - Add `STRIPE_WEBHOOK_SECRET`
   - Add `CLERK_WEBHOOK_SECRET` (if needed)
   - Add `GEMINI_API_KEY` (if needed)

### Method 2: Convex CLI

```bash
# Set Stripe Secret Key
bunx convex env set STRIPE_SECRET_KEY "sk_test_..."

# Set Stripe Webhook Secret
bunx convex env set STRIPE_WEBHOOK_SECRET "whsec_..."

# Set Clerk Webhook Secret
bunx convex env set CLERK_WEBHOOK_SECRET "whsec_..."

# Set Gemini API Key
bunx convex env set GEMINI_API_KEY "your_key_here"
```

### Method 3: Automated Script

Run this script to copy from `.env.local` to Convex:

```bash
bun run scripts/set-convex-env.js
```

## 🔍 Verify Environment Variables

### Check in Dashboard
1. Go to Convex Dashboard > Settings > Environment Variables
2. Verify all variables are listed

### Check via CLI
```bash
bunx convex env list
```

### Test Webhook
After setting variables, test the webhook:
```bash
bun run stripe:test-webhooks
```

## 📝 Quick Reference

| Variable | Where to Get It | Required For |
|----------|----------------|--------------|
| `STRIPE_SECRET_KEY` | `.env.local` or Stripe Dashboard | Stripe API calls |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Webhooks | Webhook verification |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard > Webhooks | Clerk webhooks |
| `GEMINI_API_KEY` | Google AI Studio | AI plan generation |

## ⚠️ Important Notes

1. **Never commit secrets** - Environment variables in Convex are encrypted
2. **Different environments** - You can set different values for dev/prod
3. **Restart required** - After setting variables, Convex functions will automatically reload
4. **Case sensitive** - Variable names are case-sensitive

## 🐛 Troubleshooting

### Error: "Neither apiKey nor config.authenticator provided"
- **Cause:** `STRIPE_SECRET_KEY` not set in Convex
- **Fix:** Set it in Convex Dashboard > Settings > Environment Variables

### Error: "Missing STRIPE_WEBHOOK_SECRET"
- **Cause:** `STRIPE_WEBHOOK_SECRET` not set in Convex
- **Fix:** Set it in Convex Dashboard > Settings > Environment Variables

### Webhook still failing after setting variables
- **Check:** Variables are set correctly (no extra spaces)
- **Check:** Webhook secret matches Stripe Dashboard
- **Check:** Convex functions have reloaded (wait 10-30 seconds)

## ✅ Next Steps

1. ✅ Set `STRIPE_SECRET_KEY` in Convex Dashboard
2. ✅ Set `STRIPE_WEBHOOK_SECRET` in Convex Dashboard
3. ✅ Test webhook: `bun run stripe:test-webhooks`
4. ✅ Verify webhook works in Convex logs

---

**Status:** ✅ **Code fixed!** Now set environment variables in Convex Dashboard.

