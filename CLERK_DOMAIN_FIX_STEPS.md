# 🔧 Quick Fix: Clerk Domain Error

## Problem
Error: `accounts.derrimut.aliaslabs.ai unexpectedly closed the connection`

## Root Cause
Clerk is configured to use a custom domain (`accounts.derrimut.aliaslabs.ai`) that either:
- Isn't configured in Clerk Dashboard
- Doesn't have DNS set up
- Should be removed to use Clerk's default domain

## Quick Fix (5 minutes)

### Step 1: Log in to Clerk Dashboard
1. Go to: https://dashboard.clerk.com
2. Sign in with your account

### Step 2: Select Production App
1. Select app: **derrimut** (production)
2. Make sure you're in the production instance, not dev

### Step 3: Remove Custom Domain
1. Navigate to: **Settings** → **Domains**
2. Scroll to **Custom Domains** section
3. If you see `accounts.derrimut.aliaslabs.ai`:
   - **Click the delete/remove button** (trash icon)
   - Confirm deletion
   - This will make Clerk use its default domain

### Step 4: Configure Allowed Origins
1. In the same **Settings** → **Domains** page
2. Scroll to **Allowed Origins** section
3. Click **Add Origin**
4. Add these one by one:
   - `derrimut.aliaslabs.ai`
   - `https://derrimut.aliaslabs.ai`
   - `*.vercel.app` (for preview deployments)

### Step 5: Configure Redirect URLs
1. Navigate to: **Settings** → **Paths** (or **Redirect URLs**)
2. Add these URLs:
   - `https://derrimut.aliaslabs.ai/*`
   - `https://derrimut.aliaslabs.ai/sign-in`
   - `https://derrimut.aliaslabs.ai/sign-up`

### Step 6: Save and Test
1. Click **Save** on all changes
2. Wait 1-2 minutes for changes to propagate
3. Refresh your site: https://derrimut.aliaslabs.ai
4. Try signing in - it should work!

## Alternative: Set Up Custom Domain (If You Want)

If you want to keep `accounts.derrimut.aliaslabs.ai`:

1. **In Clerk Dashboard:**
   - Settings → Domains → Custom Domains
   - Add: `accounts.derrimut.aliaslabs.ai`
   - Clerk will show you DNS instructions

2. **Set up DNS:**
   - Go to your DNS provider (where `aliaslabs.ai` is hosted)
   - Add CNAME record:
     - Name: `accounts.derrimut`
     - Value: (Clerk will provide this)
   - Wait for DNS propagation (can take up to 48 hours)

3. **Verify in Clerk:**
   - Wait for Clerk to verify the DNS
   - Status should change to "Active"

## Recommended Solution

**Remove the custom domain** and use Clerk's default domain. It works immediately without DNS setup!

After removing the custom domain, Clerk will automatically use:
- `clerk.derrimut.aliaslabs.ai` (if configured)
- Or `busy-cow-62.clerk.accounts.dev` (default)

Either way, it will work without any DNS changes!

