# 🔧 Environment Keys Configuration Guide

## 📋 Key Strategy

### Development (localhost)
- **Use DEV/TEST keys** for all services
- Configured in `.env.local`
- Used when running `bun run dev` locally

### Production (Vercel)
- **Use PRODUCTION/LIVE keys** for all services
- Configured in Vercel environment variables
- Used when deployed to `derrimut.aliaslabs.ai`

## 🔑 Clerk Keys

### Development Keys (for localhost)
```env
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_DEV_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_DEV_CLERK_SECRET_KEY
```

**Why:** Production Clerk keys (`pk_live_...`) only work on configured domains (`derrimut.aliaslabs.ai`). They will fail on `localhost:3000` with origin errors.

### Production Keys (for Vercel)
```env
# Vercel Environment Variables (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PROD_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_PROD_CLERK_SECRET_KEY
```

**Why:** Production keys are required for the live domain and provide higher rate limits.

## 💳 Stripe Keys

### Development Keys (for localhost & testing)
```env
# .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Why:** Test keys allow safe testing without real charges. Use Stripe test cards (4242 4242 4242 4242).

### Production Keys (for live site)
```env
# Vercel Environment Variables (Production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**Why:** Live keys process real payments. Only use when ready for production.

## 🗄️ Convex URLs

### Development
```env
# .env.local
NEXT_PUBLIC_CONVEX_URL=https://enchanted-salamander-914.convex.cloud
CONVEX_DEPLOYMENT=enchanted-salamander-914
```

**Why:** Separate dev database for testing without affecting production data.

### Production
```env
# Vercel Environment Variables (Production)
NEXT_PUBLIC_CONVEX_URL=https://spotted-gerbil-236.convex.cloud
CONVEX_DEPLOYMENT=spotted-gerbil-236
```

**Why:** Production database with real user data.

## 📝 Quick Reference

### For Local Development
1. **Use `.env.local`** with DEV/TEST keys
2. **Restart dev server** after changing keys: `bun run dev`
3. **Test on:** `http://localhost:3000`

### For Production Deployment
1. **Set in Vercel** environment variables with PROD/LIVE keys
2. **Deploy:** `vercel --prod`
3. **Test on:** `https://derrimut.aliaslabs.ai`

## ⚠️ Important Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Never commit production keys** - Use Vercel environment variables
3. **Clerk production keys don't work on localhost** - Must use dev keys
4. **Stripe test keys work everywhere** - Safe for development
5. **Convex dev/prod are separate** - Data doesn't mix

## 🔍 How to Check Current Keys

### Check .env.local (local development)
```bash
# View Clerk keys
grep CLERK .env.local

# View Stripe keys
grep STRIPE .env.local

# View Convex URL
grep CONVEX .env.local
```

### Check Vercel (production)
```bash
vercel env ls
```

### Check Convex (backend)
```bash
# Dev deployment
bunx convex env list

# Prod deployment
bunx convex env list --prod
```

## 🚀 Setup Commands

### Update .env.local with Dev Keys
```bash
# Edit .env.local and add:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://enchanted-salamander-914.convex.cloud
```

### Set Vercel Production Keys
```bash
# Use the automated script
bun run vercel:set-env

# Or manually
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
```

## ✅ Verification Checklist

### Local Development
- [ ] `.env.local` has DEV Clerk keys (`pk_test_...`, `sk_test_...`)
- [ ] `.env.local` has DEV Convex URL (`enchanted-salamander-914`)
- [ ] `.env.local` has Stripe TEST keys (`sk_test_...`, `pk_test_...`)
- [ ] Dev server restarted after changes
- [ ] Can sign in on `localhost:3000`

### Production
- [ ] Vercel has PROD Clerk keys (`pk_live_...`, `sk_live_...`)
- [ ] Vercel has PROD Convex URL (`spotted-gerbil-236`)
- [ ] Vercel has Stripe keys (test or live, depending on stage)
- [ ] Domain configured in Clerk Dashboard
- [ ] Can sign in on `derrimut.aliaslabs.ai`

## 🐛 Troubleshooting

### Error: "Production Keys are only allowed for domain..."
**Cause:** Using production Clerk keys on localhost  
**Fix:** Update `.env.local` with dev Clerk keys (`pk_test_...`)

### Error: "This site can't be reached accounts.derrimut..."
**Cause:** DNS records not configured for Clerk custom domain  
**Fix:** Add CNAME records or use default Clerk domain

### Error: "Neither apiKey nor config.authenticator provided"
**Cause:** Stripe keys not set in Convex  
**Fix:** Run `bun run convex:set-env-all`

## 📚 Related Documentation

- `ENVIRONMENT_SETUP_STATUS.md` - Current environment status
- `CONVEX_ENV_SETUP.md` - Convex environment setup guide
- `VERCEL_DEPLOYMENT.md` - Vercel deployment guide
- `CLERK_DOMAIN_FIX.md` - Clerk domain configuration

