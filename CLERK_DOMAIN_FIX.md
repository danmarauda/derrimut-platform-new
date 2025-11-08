# 🔧 Fix: Clerk Domain Configuration Issue

## Problem
Error: `accounts.derrimut.aliaslabs.ai unexpectedly closed the connection`

This happens when Clerk tries to use a custom domain that isn't configured.

## Solution Options

### Option 1: Use Clerk's Default Domain (Recommended - Easiest)

Clerk will automatically use its default domain (e.g., `clerk.derrimut.aliaslabs.ai` or `busy-cow-62.clerk.accounts.dev`).

**Steps:**
1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Select your production app: `derrimut`
3. Navigate to: **Settings** → **Domains**
4. **Don't add a custom domain** - just use the default
5. Make sure `derrimut.aliaslabs.ai` is in **Allowed Origins** (not custom domain)

### Option 2: Configure Custom Domain in Clerk

If you want to use `accounts.derrimut.aliaslabs.ai`:

1. **In Clerk Dashboard:**
   - Go to: **Settings** → **Domains**
   - Click **Add Custom Domain**
   - Enter: `accounts.derrimut.aliaslabs.ai`
   - Follow DNS setup instructions

2. **Set up DNS:**
   - Add CNAME record: `accounts.derrimut` → Clerk's provided domain
   - Wait for DNS propagation (can take up to 48 hours)

3. **Update Convex Auth Config:**
   - Update `convex/auth.config.ts` with the new domain

## Quick Fix: Check Current Setup

1. **Verify Clerk Domain:**
   - Check what domain Clerk is actually using
   - Look at your Clerk publishable key: `pk_live_Y2xlcmsuZGVycmltdXQuYWxpYXNsYWJzLmFpJA`
   - Decode or check in Clerk Dashboard

2. **Check Allowed Origins:**
   - Clerk Dashboard → Settings → Domains
   - Ensure `derrimut.aliaslabs.ai` is listed
   - Ensure `https://derrimut.aliaslabs.ai` is in redirect URLs

3. **Verify Environment Variables:**
   - Make sure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set correctly in Vercel
   - Should be the production key: `pk_live_...`

## Most Likely Issue

The app is trying to use a custom domain that hasn't been set up. **Use Clerk's default domain** for now - it will work immediately without DNS configuration.

