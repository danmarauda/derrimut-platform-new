# Environment Variables Verification Report
## Vercel Production vs Required Variables

**Date:** January 2025  
**Status:** ✅ MOSTLY CORRECT - Minor Issues Found

---

## ✅ Currently Set in Vercel Production

### Core Required Variables (All Set ✅)
1. ✅ **NEXT_PUBLIC_CONVEX_URL** - Set (Encrypted)
2. ✅ **CONVEX_DEPLOYMENT** - Set (Encrypted)
3. ✅ **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY** - Set (Encrypted)
4. ✅ **CLERK_SECRET_KEY** - Set (Encrypted)
5. ✅ **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** - Set (Encrypted)
6. ✅ **STRIPE_SECRET_KEY** - Set (Encrypted)
7. ✅ **STRIPE_WEBHOOK_SECRET** - Set (Encrypted)

### Sentry (All Set ✅)
8. ✅ **NEXT_PUBLIC_SENTRY_DSN** - Set (Encrypted)
9. ✅ **SENTRY_ORG** - Set (Encrypted)
10. ✅ **SENTRY_PROJECT** - Set (Encrypted)
11. ✅ **SENTRY_AUTH_TOKEN** - Set (Encrypted)

### Analytics (Set ✅)
12. ✅ **NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT** - Set

---

## ⚠️ Optional Variables (Not Set - Feature-Specific)

### Optional but Recommended
1. ⚠️ **CLERK_WEBHOOK_SECRET** - Not set
   - **Required for:** Clerk webhook user sync
   - **Impact:** User sync from Clerk to Convex may not work automatically
   - **Status:** Optional (can be set if webhooks are configured)

2. ⚠️ **GEMINI_API_KEY** - Not set
   - **Required for:** AI plan generation (`/generate-program`)
   - **Impact:** AI plan generation feature won't work
   - **Status:** Optional (only needed if using AI features)

3. ⚠️ **NEXT_PUBLIC_VAPI_API_KEY** - Not set
   - **Required for:** Voice AI consultations
   - **Impact:** Voice AI features won't work
   - **Status:** Optional (only needed if using VAPI)

4. ⚠️ **NEXT_PUBLIC_VAPI_WORKFLOW_ID** - Not set
   - **Required for:** Voice AI workflow
   - **Impact:** Voice AI features won't work
   - **Status:** Optional (only needed if using VAPI)

5. ⚠️ **NEXT_PUBLIC_CHATBASE_CHAT_ID** - Not set
   - **Required for:** Chatbase chat widget
   - **Impact:** Chat widget won't appear
   - **Status:** Optional (only needed if using Chatbase)

---

## 🔍 Verification Needed

### 1. Convex Production URL Match
**Check:** Verify `NEXT_PUBLIC_CONVEX_URL` in Vercel matches your Convex production deployment URL.

**Expected Format:**
```
NEXT_PUBLIC_CONVEX_URL=https://[deployment-name].convex.cloud
```

**To Verify:**
```bash
# Check Convex production deployment
bunx convex deployments --prod

# Check Vercel env var (will show encrypted)
vercel env ls production | grep CONVEX_URL
```

### 2. Stripe Keys - Test vs Live
**Current Status:** Convex production shows test keys (`sk_test_...`)

**Question:** Are you using Stripe test keys intentionally, or should they be live keys?

**If Production Should Use Live Keys:**
- Update `STRIPE_SECRET_KEY` in Vercel to `sk_live_...`
- Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel to `pk_live_...`
- Update `STRIPE_WEBHOOK_SECRET` in Vercel to production webhook secret
- Update Convex production env vars to match

### 3. Clerk Custom Domains
**Issue Found:** CSP errors show Clerk trying to use custom domains:
- `clerk.derrimut.aliaslabs.ai`
- `accounts.derrimut.aliaslabs.ai`

**Action Required:** Update CSP in `next.config.ts` to allow these domains:

```typescript
"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://clerk.derrimut.aliaslabs.ai https://js.stripe.com https://cdn.vapi.ai https://browser.sentry-cdn.com",
"connect-src 'self' https://*.convex.cloud https://clerk.com https://*.clerk.accounts.dev https://accounts.derrimut.aliaslabs.ai https://clerk.derrimut.aliaslabs.ai https://api.stripe.com https://api.vapi.ai https://generativelanguage.googleapis.com https://*.sentry.io wss://*.convex.cloud",
```

---

## ✅ Summary

### Core Functionality: ✅ READY
All required environment variables for core functionality are set:
- ✅ Convex backend connection
- ✅ Clerk authentication
- ✅ Stripe payments
- ✅ Sentry error tracking

### Optional Features: ⚠️ PARTIAL
Optional features may not work without additional env vars:
- ⚠️ AI plan generation (needs GEMINI_API_KEY)
- ⚠️ Voice AI (needs VAPI keys)
- ⚠️ Chat widget (needs Chatbase ID)
- ⚠️ Clerk webhooks (needs CLERK_WEBHOOK_SECRET)

---

## 🎯 Recommendations

### Immediate Actions
1. ✅ **Verify Convex URL** - Ensure `NEXT_PUBLIC_CONVEX_URL` matches production deployment
2. ✅ **Fix CSP** - Add Clerk custom domains to Content Security Policy
3. ⚠️ **Stripe Keys** - Confirm if test keys are intentional or switch to live keys

### Optional Actions (If Features Needed)
1. Add `GEMINI_API_KEY` if using AI plan generation
2. Add `CLERK_WEBHOOK_SECRET` if using Clerk webhooks
3. Add VAPI keys if using voice AI
4. Add Chatbase ID if using chat widget

---

## 📋 Quick Verification Commands

```bash
# Check Vercel production env vars
vercel env ls production

# Check Convex production deployment
bunx convex deployments --prod

# Check Convex production env vars
bunx convex env list --prod

# Verify Convex URL matches
# Compare NEXT_PUBLIC_CONVEX_URL from Vercel with Convex deployment URL
```

---

**Report Generated:** January 2025  
**Status:** ✅ Core variables correct, optional features need configuration

