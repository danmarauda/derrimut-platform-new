# Resend Setup via Vercel - Quick Guide

**Created:** 2025-01-09  
**Status:** Ready to Run

---

## Quick Setup

Run the automated setup script:

```bash
node scripts/setup-resend.js
```

This script will:
1. ✅ Prompt for Resend API key
2. ✅ Set Vercel environment variables (Production, Preview, Development)
3. ✅ Save to `.env.local` for local development
4. ✅ Provide instructions for Convex setup

---

## Manual Setup (Alternative)

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Create a new API key
5. Copy the key (starts with `re_`)

### 2. Set Vercel Environment Variables

#### Option A: Via Vercel CLI

```bash
# Login to Vercel (if not already)
vercel login

# Set environment variables
echo "YOUR_RESEND_API_KEY" | vercel env add RESEND_API_KEY production
echo "Derrimut 24:7 <noreply@derrimut247.com.au" | vercel env add RESEND_FROM_EMAIL production
echo "support@derrimut247.com.au" | vercel env add RESEND_SUPPORT_EMAIL production

# Also set for Preview and Development
echo "YOUR_RESEND_API_KEY" | vercel env add RESEND_API_KEY preview
echo "YOUR_RESEND_API_KEY" | vercel env add RESEND_API_KEY development
```

#### Option B: Via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: **derrimut-gym-platform**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxx` | Production, Preview, Development |
| `RESEND_FROM_EMAIL` | `Derrimut 24:7 <noreply@derrimut247.com.au>` | Production, Preview, Development |
| `RESEND_SUPPORT_EMAIL` | `support@derrimut247.com.au` | Production, Preview, Development |

### 3. Set Convex Environment Variables

1. Go to [dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=Derrimut 24:7 <noreply@derrimut247.com.au>
RESEND_SUPPORT_EMAIL=support@derrimut247.com.au
NEXTJS_URL=https://derrimut247.com.au
```

### 4. Local Development (.env.local)

Add to your `.env.local` file:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=Derrimut 24:7 <noreply@derrimut247.com.au>
RESEND_SUPPORT_EMAIL=support@derrimut247.com.au
```

---

## Domain Verification (Optional)

For production, verify your domain in Resend:

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click **Add Domain**
3. Enter: `derrimut247.com.au`
4. Add DNS records to your domain provider:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT)
5. Wait for verification (5-10 minutes)

**Note:** Until domain is verified, use Resend's test domain:
```
Derrimut 24:7 <onboarding@resend.dev>
```

---

## Testing

After setup, test email sending:

1. **Create a booking:**
   - Book a training session
   - Check email for confirmation

2. **Place an order:**
   - Add items to cart
   - Complete checkout
   - Check email for order confirmation

3. **Submit contact form:**
   - Fill out contact form
   - Check both support and user emails

---

## Troubleshooting

### "RESEND_API_KEY not set"
- Verify variable is set in Vercel dashboard
- Check variable name (case-sensitive)
- Ensure it's set for correct environment (Production/Preview/Development)

### "Domain not verified"
- Use `onboarding@resend.dev` for testing
- Or verify domain in Resend dashboard

### Emails not sending
- Check Vercel function logs
- Check Resend dashboard for delivery status
- Verify API key is valid

---

## Verification

Check if variables are set:

```bash
# Check Vercel variables
vercel env ls

# Check local variables
cat .env.local | grep RESEND
```

---

**Status:** ✅ Script Ready  
**Run:** `node scripts/setup-resend.js`


