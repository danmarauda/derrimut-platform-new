# 🚀 Quick Vercel Deployment Commands

## One-Line Setup

```bash
# 1. Login (if not already)
vercel login

# 2. Link project
vercel link

# 3. Set environment variables (run each command)
echo "YOUR_CLERK_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
echo "YOUR_CLERK_SECRET_KEY" | vercel env add CLERK_SECRET_KEY production
echo "https://spotted-gerbil-236.convex.cloud" | vercel env add NEXT_PUBLIC_CONVEX_URL production
echo "spotted-gerbil-236" | vercel env add CONVEX_DEPLOYMENT production

# 4. Deploy
vercel --prod
```

## Environment Variables Checklist

### Required for Production:
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk_live_...)
- [ ] `CLERK_SECRET_KEY` (sk_live_...)
- [ ] `NEXT_PUBLIC_CONVEX_URL` (https://spotted-gerbil-236.convex.cloud)
- [ ] `CONVEX_DEPLOYMENT` (spotted-gerbil-236)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
- [ ] `STRIPE_SECRET_KEY` (sk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` (whsec_...)

## Clerk Configuration

After deployment, update Clerk:
1. Go to: https://dashboard.clerk.com
2. Select app: `derrimut`
3. Navigate to: **Domains** or **Settings** → **Domains**
4. Add: `derrimut.aliaslabs.ai`
5. Update redirect URLs to include `https://derrimut.aliaslabs.ai/*`

