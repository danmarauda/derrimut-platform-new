# 🧪 Payment Flow Testing Guide

## 📋 Current Status

### ✅ Completed Setup
1. **Membership Plans Seeded** - All 4 Derrimut plans created in Convex
2. **Environment Variables** - Stripe keys configured in Convex (dev & prod)
3. **Membership Page** - Plans displaying correctly
4. **API Routes** - Checkout session API ready
5. **Webhook Handler** - Stripe webhook configured in Convex

### ⚠️ Current Blocker
**Clerk Production Keys on Localhost**
- Production Clerk keys don't work on `localhost:3000`
- Need to update `.env.local` with DEV Clerk keys
- Restart dev server after updating

## 🔄 Complete Payment Flow

### Step 1: Sign In
1. User clicks **"Sign In to Subscribe"** on membership plan
2. Redirects to `/sign-in?redirect_url=/membership`
3. User signs in with Clerk (requires DEV keys for localhost)
4. Redirects back to `/membership`

### Step 2: Select Plan
1. User clicks plan button again (now authenticated)
2. `handleSubscribe()` function called
3. POST request to `/api/create-checkout-session` with:
   - `priceId`: Stripe price ID
   - `clerkId`: User's Clerk ID
   - `membershipType`: Plan type (e.g., "18-month-minimum")

### Step 3: Stripe Checkout
1. API creates Stripe checkout session
2. Returns checkout URL
3. User redirected to Stripe checkout page
4. User enters payment details:
   - **Test Card:** `4242 4242 4242 4242`
   - **Expiry:** `12/34`
   - **CVC:** `123`
5. User completes payment

### Step 4: Webhook Processing
1. Stripe sends `checkout.session.completed` event
2. Webhook received at: `https://enchanted-salamander-914.convex.site/stripe-webhook`
3. Convex handler (`convex/http.ts`) processes event:
   - Verifies webhook signature
   - Extracts `clerkId` and `membershipType` from metadata
   - Creates membership in Convex database
   - Links to user via Clerk ID

### Step 5: Success Page
1. User redirected to `/membership/success?session_id={CHECKOUT_SESSION_ID}`
2. Page queries user's membership from Convex
3. Displays membership details and confirmation

## 🔧 Setup Required Before Testing

### 1. Update .env.local with DEV Clerk Keys

```env
# Clerk (DEV - for localhost)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_DEV_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_DEV_CLERK_SECRET_KEY

# Convex (DEV deployment)
NEXT_PUBLIC_CONVEX_URL=https://enchanted-salamander-914.convex.cloud
CONVEX_DEPLOYMENT=enchanted-salamander-914

# Stripe (TEST keys)
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_TEST_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
bun run dev
```

### 3. Verify Setup

```bash
# Check Convex env vars
bunx convex env list

# Should show:
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🧪 Testing Steps

### Test 1: Membership Subscription Flow

1. **Navigate to membership page:**
   ```
   http://localhost:3000/membership
   ```

2. **Click "Sign In to Subscribe"** on any plan
   - Should redirect to `/sign-in`
   - Clerk sign-in should load (no errors)

3. **Sign in or create account**
   - Use test email/password
   - Should redirect back to `/membership`

4. **Click plan button again**
   - Should call `/api/create-checkout-session`
   - Should redirect to Stripe checkout

5. **Complete Stripe checkout**
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - Name: Any name
   - Email: Any email

6. **Verify webhook processing**
   ```bash
   # Check Convex logs
   bunx convex logs --tail
   ```
   - Should see webhook event received
   - Should see membership created

7. **Verify success page**
   - Should redirect to `/membership/success`
   - Should show membership details

8. **Verify membership in database**
   ```bash
   # Query user's membership
   bunx convex run memberships:getUserMembership '{"clerkId": "YOUR_CLERK_ID"}'
   ```

## 🔍 Monitoring & Debugging

### Check Convex Logs
```bash
# Real-time logs
bunx convex logs --tail

# Recent logs
bunx convex logs --history 50
```

### Check Browser Console
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls

### Check API Routes
- `/api/create-checkout-session` - Should return `{ sessionId, url }`
- Check server logs for errors

### Verify Stripe Webhook
- Stripe Dashboard → Webhooks
- Check event delivery status
- Verify webhook URL: `https://enchanted-salamander-914.convex.site/stripe-webhook`

## 🐛 Troubleshooting

### Issue: Clerk sign-in not loading
**Cause:** Production keys on localhost  
**Fix:** Update `.env.local` with DEV keys and restart server

### Issue: "Invalid plan data" error
**Cause:** Plan missing `stripePriceId`  
**Fix:** Verify plans are seeded correctly:
```bash
bun run scripts/seed-membership-plans.js
```

### Issue: Webhook not received
**Cause:** Webhook URL incorrect or not configured  
**Fix:** 
1. Check Stripe Dashboard → Webhooks
2. Verify URL: `https://enchanted-salamander-914.convex.site/stripe-webhook`
3. Check webhook secret matches Convex env var

### Issue: Membership not created
**Cause:** Webhook handler error  
**Fix:** Check Convex logs for errors:
```bash
bunx convex logs --history 50
```

## 📊 Expected Results

### After Successful Payment
1. ✅ Stripe checkout session created
2. ✅ Payment processed (test mode)
3. ✅ Webhook received in Convex
4. ✅ Membership created in Convex database
5. ✅ User redirected to success page
6. ✅ Membership visible in user profile

### Database Records Created
- `memberships` collection entry with:
  - `clerkId`: User's Clerk ID
  - `membershipType`: Plan type
  - `status`: "active"
  - `stripeSubscriptionId`: Stripe subscription ID
  - `currentPeriodStart`: Subscription start date
  - `currentPeriodEnd`: Subscription end date

## 🎯 Next Steps After Testing

1. **Test other payment flows:**
   - Marketplace checkout
   - Trainer booking payments

2. **Test edge cases:**
   - Payment failures
   - Subscription cancellations
   - Plan upgrades/downgrades

3. **Production testing:**
   - Deploy to Vercel
   - Test on `derrimut.aliaslabs.ai`
   - Use production Stripe keys (live mode)

## 📝 Test Checklist

- [ ] Dev Clerk keys configured in `.env.local`
- [ ] Dev server restarted
- [ ] Membership plans visible on page
- [ ] Can sign in with Clerk
- [ ] Can click plan and get Stripe checkout
- [ ] Can complete Stripe payment
- [ ] Webhook received in Convex
- [ ] Membership created in database
- [ ] Success page displays correctly
- [ ] Membership visible in user profile

## 🔗 Related Documentation

- `ENVIRONMENT_KEYS_GUIDE.md` - Environment keys configuration
- `ENVIRONMENT_SETUP_STATUS.md` - Current environment status
- `PAYMENT_FLOW_TESTING.md` - General payment testing guide
- `STRIPE_CONVEX_QUICKSTART.md` - Stripe-Convex integration guide

