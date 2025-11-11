# Resend Setup Guide - Using Your Vercel Account

**Status:** Ready to Configure  
**Vercel Account:** alias-com-ai ✅

---

## Quick Setup Steps

### Step 1: Get Resend API Key

1. Go to **[resend.com](https://resend.com)** and sign up/login
2. Navigate to **API Keys** section (left sidebar)
3. Click **Create API Key**
4. Name it: `Derrimut Production`
5. Copy the key (starts with `re_`)

---

### Step 2: Set Vercel Environment Variables

You're already logged into Vercel CLI as `alias-com-ai`. Run these commands:

```bash
# Set Resend API Key (Production)
echo "YOUR_RESEND_API_KEY_HERE" | vercel env add RESEND_API_KEY production

# Set From Email (Production)
echo "Derrimut 24:7 <noreply@derrimut247.com.au>" | vercel env add RESEND_FROM_EMAIL production

# Set Support Email (Production)
echo "support@derrimut247.com.au" | vercel env add RESEND_SUPPORT_EMAIL production

# Also set for Preview environment
echo "YOUR_RESEND_API_KEY_HERE" | vercel env add RESEND_API_KEY preview
echo "Derrimut 24:7 <noreply@derrimut247.com.au>" | vercel env add RESEND_FROM_EMAIL preview
echo "support@derrimut247.com.au" | vercel env add RESEND_SUPPORT_EMAIL preview

# And Development environment
echo "YOUR_RESEND_API_KEY_HERE" | vercel env add RESEND_API_KEY development
echo "Derrimut 24:7 <noreply@derrimut247.com.au>" | vercel env add RESEND_FROM_EMAIL development
echo "support@derrimut247.com.au" | vercel env add RESEND_SUPPORT_EMAIL development
```

**Replace `YOUR_RESEND_API_KEY_HERE` with your actual Resend API key.**

---

### Step 3: Set Convex Environment Variables

1. Go to **[dashboard.convex.dev](https://dashboard.convex.dev)**
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=Derrimut 24:7 <noreply@derrimut247.com.au>
RESEND_SUPPORT_EMAIL=support@derrimut247.com.au
NEXTJS_URL=https://derrimut247.com.au
```

---

### Step 4: Add to Local Development (.env.local)

Add to your `.env.local` file:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=Derrimut 24:7 <noreply@derrimut247.com.au>
RESEND_SUPPORT_EMAIL=support@derrimut247.com.au
```

---

## Alternative: Use Vercel Dashboard

If you prefer using the web interface:

1. Go to **[vercel.com/dashboard](https://vercel.com/dashboard)**
2. Select project: **derrimut-gym-platform**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable:

| Variable | Value | Environments |
|----------|-------|--------------|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxx` | ✅ Production<br>✅ Preview<br>✅ Development |
| `RESEND_FROM_EMAIL` | `Derrimut 24:7 <noreply@derrimut247.com.au>` | ✅ Production<br>✅ Preview<br>✅ Development |
| `RESEND_SUPPORT_EMAIL` | `support@derrimut247.com.au` | ✅ Production<br>✅ Preview<br>✅ Development |

---

## Domain Verification (Optional)

For production, verify your domain in Resend:

1. Go to **[resend.com/domains](https://resend.com/domains)**
2. Click **Add Domain**
3. Enter: `derrimut247.com.au`
4. Add DNS records to your domain provider:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)  
   - **DMARC Record** (TXT)
5. Wait for verification (5-10 minutes)

**Note:** Until domain is verified, you can use:
```
Derrimut 24:7 <onboarding@resend.dev>
```

---

## Verify Setup

Check if variables are set:

```bash
# List Vercel environment variables
vercel env ls

# Should show:
# RESEND_API_KEY (Production, Preview, Development)
# RESEND_FROM_EMAIL (Production, Preview, Development)
# RESEND_SUPPORT_EMAIL (Production, Preview, Development)
```

---

## Test Email Sending

After setup, test by:

1. **Create a booking** → Check email for confirmation
2. **Place an order** → Check email for order confirmation
3. **Submit contact form** → Check both support and user emails

---

## Troubleshooting

### "RESEND_API_KEY not set"
- Verify variable is set: `vercel env ls`
- Check variable name (case-sensitive)
- Ensure it's set for correct environment

### "Domain not verified"
- Use `onboarding@resend.dev` for testing
- Or verify domain in Resend dashboard

### Emails not sending
- Check Vercel function logs
- Check Resend dashboard for delivery status
- Verify API key is valid

---

## Quick Command Reference

```bash
# Set all Resend variables at once (replace YOUR_KEY)
RESEND_KEY="re_YOUR_KEY_HERE"

echo "$RESEND_KEY" | vercel env add RESEND_API_KEY production
echo "$RESEND_KEY" | vercel env add RESEND_API_KEY preview
echo "$RESEND_KEY" | vercel env add RESEND_API_KEY development

echo "Derrimut 24:7 <noreply@derrimut247.com.au>" | vercel env add RESEND_FROM_EMAIL production preview development
echo "support@derrimut247.com.au" | vercel env add RESEND_SUPPORT_EMAIL production preview development
```

---

**Next Steps:**
1. ✅ Get Resend API key from resend.com
2. ✅ Run the commands above to set Vercel variables
3. ✅ Set Convex variables manually
4. ✅ Test email sending

**Status:** Ready to Configure  
**Vercel CLI:** ✅ Logged in as `alias-com-ai`


