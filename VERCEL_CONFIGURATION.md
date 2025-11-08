# Vercel Configuration Guide - Derrimut Platform

**Version:** 1.0.0
**Last Updated:** January 9, 2025

---

## Overview

This document provides comprehensive guidance for configuring Vercel for production deployment of the Derrimut Platform.

---

## Security Settings

### Deployment Protection

**Status:** ✅ Recommended - Enable

**Configuration:**
1. Go to Vercel Dashboard → Project Settings → Security
2. Enable "Deployment Protection"
3. Configure protection level:
   - **Standard Protection:** Password-protect preview deployments
   - **Vercel Authentication:** Require Vercel login for previews

**Recommended:** Standard Protection with password

```
Password: [Generate strong password, store in 1Password]
Share password with: Engineering team, Product team
```

### Web Application Firewall (WAF)

**Status:** ✅ Recommended - Enable (Enterprise plan)

**Features:**
- DDoS mitigation
- Bot protection
- IP blocking rules
- Managed rulesets

**Configuration:**
1. Go to Vercel Dashboard → Project → Security → Firewall
2. Enable Firewall
3. Configure rules:
   - **Block suspicious IPs:** Enabled
   - **Rate limiting:** 100 requests/minute per IP
   - **Bot detection:** Enabled

### IP Blocking

**Status:** ⚠️ Optional - Configure if needed

**Use Cases:**
- Block malicious IP ranges
- Restrict access to specific regions
- Block known bad actors

**Configuration:**
```bash
# Add via Vercel CLI or Dashboard
vercel dns add-record --name @ --type A --value 0.0.0.0 --ttl 60
```

---

## Performance Settings

### Speed Insights

**Status:** ✅ Recommended - Enable

**Benefits:**
- Real User Monitoring (RUM)
- Core Web Vitals tracking
- Performance optimization recommendations

**Configuration:**
1. Go to Vercel Dashboard → Analytics → Speed Insights
2. Click "Enable Speed Insights"
3. Deploy updated code with analytics package

```bash
# Install Speed Insights
npm install @vercel/speed-insights

# Add to layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Image Optimization

**Status:** ✅ Enabled by default

**Configuration:**
- Automatic WebP/AVIF conversion
- Lazy loading
- Responsive images
- CDN caching

**Verify using Next.js Image component:**
```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Derrimut 24:7 Gym"
  width={200}
  height={100}
  priority={isAboveFold}
/>
```

### Edge Caching

**Status:** ✅ Automatic

**Cache Locations:**
- Primary: Sydney (syd1)
- Fallback: Melbourne, Brisbane, Perth

**Cache Headers:**
```typescript
// Set in next.config.ts
export default {
  headers: async () => [
    {
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    }
  ]
}
```

### Function Region

**Status:** ✅ Configure for Australia

**Configuration:**
```typescript
// vercel.json
{
  "functions": {
    "pages/**/*.tsx": {
      "memory": 1024,
      "maxDuration": 10,
      "runtime": "nodejs20.x"
    }
  },
  "regions": ["syd1"] // Sydney
}
```

**Available regions:**
- `syd1`: Sydney, Australia (PRIMARY)
- `sin1`: Singapore (Backup)
- `hnd1`: Tokyo (Backup)

---

## Monitoring Settings

### Observability Plus

**Status:** ⚠️ Recommended - Enable (Pro/Enterprise plan)

**Features:**
- Real-time function logs
- Performance metrics
- Request tracing
- Error tracking integration

**Configuration:**
1. Go to Vercel Dashboard → Project → Observability
2. Enable Observability Plus
3. Configure log retention: 7 days (minimum)

### Log Drains

**Status:** ✅ Recommended for production

**Purpose:** Stream logs to external service

**Supported Services:**
- Datadog
- Splunk
- Sumo Logic
- Custom webhook

**Configuration:**
```bash
# Add log drain
vercel log-drain add --url https://logs.datadoghq.com/v1/input/[API_KEY]

# Verify
vercel log-drain ls
```

### Alerts

**Status:** ✅ Configure critical alerts

**Recommended Alerts:**
1. **Deployment Failure**
   - Trigger: Any deployment fails
   - Notify: Slack #engineering

2. **Error Rate Spike**
   - Trigger: Error rate >5%
   - Notify: Email + Slack

3. **Performance Degradation**
   - Trigger: P95 latency >2s
   - Notify: Slack #engineering

**Configuration:**
1. Vercel Dashboard → Project → Settings → Alerts
2. Click "New Alert"
3. Configure trigger and notification

### Audit Logs

**Status:** ✅ Enable (Enterprise plan)

**Tracks:**
- Deployment events
- Environment variable changes
- Team member actions
- Settings modifications

**Access:**
Vercel Dashboard → Team Settings → Audit Log

---

## Cost Optimization

### Fluid Compute

**Status:** ✅ Enable

**Benefits:**
- Auto-scaling based on traffic
- Pay only for actual usage
- Handles traffic spikes

**Configuration:**
1. Vercel Dashboard → Project Settings → Functions
2. Enable "Fluid Compute"
3. Set limits:
   - Max concurrent executions: 100
   - Max function duration: 10s

### Spend Management

**Status:** ✅ Recommended

**Configuration:**
1. Vercel Dashboard → Team Settings → Billing
2. Set spend limits:
   - **Soft limit:** $500/month (warning email)
   - **Hard limit:** $1000/month (block new deployments)
3. Enable billing alerts

### Function Optimization

**Status:** ✅ Review quarterly

**Optimize:**
- Reduce function duration
- Minimize bundle size
- Use Edge Runtime where possible
- Cache aggressively

**Check function usage:**
```bash
vercel logs --follow --filter=function
```

---

## Environment Configuration

### Environment Variables

**Configuration:**
1. Vercel Dashboard → Project Settings → Environment Variables

**Required Variables (Production):**
```bash
# Convex
CONVEX_DEPLOYMENT=prod:spotted-gerbil-236
NEXT_PUBLIC_CONVEX_URL=https://spotted-gerbil-236.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_[key]
CLERK_SECRET_KEY=sk_live_[key]
CLERK_WEBHOOK_SECRET=whsec_[secret]

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/profile
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/profile

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[key]
STRIPE_SECRET_KEY=sk_live_[key]
STRIPE_WEBHOOK_SECRET=whsec_[secret]

# Google Gemini
GEMINI_API_KEY=[key]

# Vapi
NEXT_PUBLIC_VAPI_API_KEY=[key]
NEXT_PUBLIC_VAPI_WORKFLOW_ID=e13b1b19-3cd5-42ab-ba5d-7c46bf989a6e
```

**Security:**
- ✅ Never use NEXT_PUBLIC_ for secrets
- ✅ Rotate keys quarterly
- ✅ Use different keys for staging/production
- ✅ Store backup in password manager

### Preview Deployment Suffix

**Status:** ✅ Configure custom suffix

**Configuration:**
1. Vercel Dashboard → Project Settings → Domains
2. Configure preview suffix: `derrimut-preview.vercel.app`

**Pattern:**
- PR #123: `pr-123-derrimut-preview.vercel.app`
- Branch `feature/ai`: `feature-ai-derrimut-preview.vercel.app`

---

## Domain & SSL Configuration

### Custom Domain

**Status:** ✅ Configure production domain

**Configuration:**
1. Vercel Dashboard → Project Settings → Domains
2. Add domain: `derrimut247.com.au`
3. Add www redirect: `www.derrimut247.com.au` → `derrimut247.com.au`

**DNS Configuration:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL/TLS

**Status:** ✅ Automatic (Let's Encrypt)

**Features:**
- Automatic certificate provisioning
- Auto-renewal every 90 days
- TLS 1.2/1.3 support
- HTTPS redirect enforced

**Verify:**
```bash
curl -I https://derrimut247.com.au
# Check for: "HTTP/2 200"
```

### Security Headers

**Status:** ✅ Configure in next.config.ts

```typescript
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

---

## Deployment Configuration

### Build Settings

**Status:** ✅ Verify configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### Branch Deployments

**Configuration:**
- `main` → Production (derrimut247.com.au)
- `staging` → Staging (staging-derrimut.vercel.app)
- Feature branches → Preview URLs

**Protection:**
- Production deployments require: All tests pass
- Enable deployment protection: Password required for previews

### Deployment Checks

**Pre-deployment Checks:**
- ✅ Build succeeds
- ✅ Tests pass (when implemented)
- ✅ Lighthouse score >90 (optional)
- ✅ No TypeScript errors

**Post-deployment Checks:**
- ✅ Health endpoint returns 200
- ✅ Critical paths render
- ✅ No console errors

---

## Recommended Settings Summary

| Setting | Status | Priority |
|---------|--------|----------|
| Deployment Protection | ✅ Enable | High |
| Speed Insights | ✅ Enable | High |
| Image Optimization | ✅ Enabled | High |
| Function Region (syd1) | ✅ Configure | High |
| Observability Plus | ⚠️ Enable (Paid) | Medium |
| Log Drains | ✅ Configure | Medium |
| Alerts | ✅ Configure | High |
| Spend Management | ✅ Configure | High |
| Custom Domain | ✅ Configure | High |
| SSL/TLS | ✅ Auto | High |
| Security Headers | ✅ Configure | High |
| WAF | ⚠️ Enable (Enterprise) | Medium |

---

## Post-Configuration Checklist

- [ ] Deployment protection enabled and tested
- [ ] Speed Insights installed and reporting
- [ ] Function region set to Sydney (syd1)
- [ ] Environment variables configured for all environments
- [ ] Custom domain configured with SSL
- [ ] Security headers implemented
- [ ] Alerts configured and tested
- [ ] Spend limits set
- [ ] Backup created of all settings
- [ ] Team members granted appropriate access

---

## Related Documentation

- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [DNS Migration Plan](./DNS_MIGRATION_PLAN.md)
- [Architecture](./docs/ARCHITECTURE.md)

---

**Document Version:** 1.0.0
**Last Updated:** January 9, 2025
