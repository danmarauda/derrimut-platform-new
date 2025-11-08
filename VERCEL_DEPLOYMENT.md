# 🚀 Vercel Production Deployment Guide

## 🎯 Objective

Deploy Derrimut 24:7 Gym platform to Vercel on `derrimut.aliaslabs.ai` for production testing.

---

## 📋 Pre-Deployment Checklist

### ✅ Required Setup
- [ ] Vercel account connected
- [ ] Domain configured: `derrimut.aliaslabs.ai`
- [ ] Convex production deployment ready
- [ ] Clerk production keys configured
- [ ] Stripe production keys configured
- [ ] All environment variables ready

---

## 🔧 Step 1: Install Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Or use Bun
bun add -g vercel
```

---

## 🔧 Step 2: Login to Vercel

```bash
vercel login
```

---

## 🔧 Step 3: Link Project to Vercel

```bash
# From project root
vercel link

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No (create new)
# - Project name: derrimut-gym-platform
# - Directory: ./
```

---

## 🔧 Step 4: Configure Environment Variables

### Required Environment Variables for Production

**Clerk (Production):**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_CLERK_SECRET_KEY
```

**Convex (Production):**
```
NEXT_PUBLIC_CONVEX_URL=https://spotted-gerbil-236.convex.cloud
CONVEX_DEPLOYMENT=spotted-gerbil-236
```

**Stripe (Production):**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Optional:**
```
GEMINI_API_KEY=...
NEXT_PUBLIC_VAPI_API_KEY=...
NEXT_PUBLIC_VAPI_WORKFLOW_ID=...
NEXT_PUBLIC_CHATBASE_ID=...
```

### Set Variables via Vercel CLI

```bash
# Set Clerk keys
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production

# Set Convex URL
vercel env add NEXT_PUBLIC_CONVEX_URL production
vercel env add CONVEX_DEPLOYMENT production

# Set Stripe keys
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production

# Optional: Set other variables
vercel env add GEMINI_API_KEY production
```

### Or Set via Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select project: `derrimut-gym-platform`
3. Navigate to: **Settings** → **Environment Variables**
4. Add each variable for **Production** environment
5. Click **Save**

---

## 🔧 Step 5: Configure Clerk for Production Domain

### Update Clerk Allowed Origins

1. **Go to Clerk Dashboard:**
   - https://dashboard.clerk.com
   - Select app: `derrimut` (production)

2. **Configure Domains:**
   - Navigate to: **Domains** or **Settings** → **Domains**
   - Add: `derrimut.aliaslabs.ai`
   - Add: `*.vercel.app` (for preview deployments)

3. **Update Redirect URLs:**
   - Navigate to: **Paths** or **Settings** → **Paths**
   - Add: `https://derrimut.aliaslabs.ai/*`
   - Add: `https://derrimut.aliaslabs.ai/sign-in`
   - Add: `https://derrimut.aliaslabs.ai/sign-up`

---

## 🔧 Step 6: Configure Domain in Vercel

### Option A: Via Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select project: `derrimut-gym-platform`
3. Navigate to: **Settings** → **Domains**
4. Add domain: `derrimut.aliaslabs.ai`
5. Follow DNS configuration instructions

### Option B: Via Vercel CLI

```bash
vercel domains add derrimut.aliaslabs.ai
```

---

## 🔧 Step 7: Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or deploy and assign domain
vercel --prod --yes
```

---

## 🔧 Step 8: Verify Deployment

### Check Deployment Status

```bash
# View deployments
vercel ls

# View production deployment
vercel inspect --prod
```

### Test Production URL

1. Visit: https://derrimut.aliaslabs.ai
2. Test authentication flow
3. Verify Clerk sign-in/sign-up works
4. Check Convex connection

---

## 🔧 Step 9: Configure Webhooks for Production

### Stripe Webhook

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/webhooks
   - Select production webhook endpoint
   - Update URL: `https://spotted-gerbil-236.convex.site/stripe-webhook`
   - Verify signing secret matches Convex production env

### Clerk Webhook

1. **Go to Clerk Dashboard:**
   - https://dashboard.clerk.com
   - Navigate to: **Webhooks**
   - Update endpoint URL: `https://spotted-gerbil-236.convex.site/clerk-webhook`
   - Verify signing secret matches Convex production env

---

## 📋 Environment Variables Reference

### Production Environment Variables

```env
# Clerk (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_CLERK_SECRET_KEY

# Convex (Production)
NEXT_PUBLIC_CONVEX_URL=https://spotted-gerbil-236.convex.cloud
CONVEX_DEPLOYMENT=spotted-gerbil-236

# Stripe (Production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional
GEMINI_API_KEY=...
NEXT_PUBLIC_VAPI_API_KEY=...
NEXT_PUBLIC_VAPI_WORKFLOW_ID=...
NEXT_PUBLIC_CHATBASE_ID=...
```

---

## 🔍 Troubleshooting

### Issue: Clerk Authentication Not Working

**Solution:**
1. Verify domain is added in Clerk Dashboard
2. Check redirect URLs are configured
3. Verify environment variables are set in Vercel
4. Check browser console for errors

### Issue: Convex Connection Failed

**Solution:**
1. Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly
2. Check Convex deployment is active
3. Verify CORS settings in Convex

### Issue: Build Fails

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Check for TypeScript errors
4. Ensure `package.json` scripts are correct

---

## 🎯 Quick Deploy Commands

```bash
# Initial setup (one-time)
vercel login
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add NEXT_PUBLIC_CONVEX_URL production
# ... add all other variables

# Deploy to production
vercel --prod

# View deployment
vercel ls
```

---

## ✅ Post-Deployment Checklist

- [ ] Site accessible at `derrimut.aliaslabs.ai`
- [ ] Clerk authentication works
- [ ] Sign-in/sign-up flows work
- [ ] Convex connection established
- [ ] Environment variables loaded correctly
- [ ] Webhooks configured for production
- [ ] SSL certificate active (automatic with Vercel)

---

**Status:** Ready to deploy! 🚀

