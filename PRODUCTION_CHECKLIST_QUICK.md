# 🚀 Quick Production Checklist Reference

## 🔴 Critical (Do First)

### Security
- [ ] CSP headers configured
- [ ] Security headers set
- [ ] Rate limiting active
- [ ] Input validation (Zod)
- [ ] CSRF protection
- [ ] Environment variables validated
- [ ] Webhook handlers consolidated

### Reliability
- [ ] Sentry error tracking
- [ ] Error boundaries
- [ ] Health check endpoint
- [ ] Log drains enabled
- [ ] Observability Plus enabled

### Testing
- [ ] Tests written (>30% coverage)
- [ ] Build errors fixed
- [ ] TypeScript errors fixed
- [ ] E2E tests passing

## 🟡 High Priority (Do Second)

### Performance
- [ ] Speed Insights enabled
- [ ] Image optimization
- [ ] Script optimization
- [ ] Font optimization
- [ ] Function region optimized

### Code Quality
- [ ] Critical `any` types fixed
- [ ] Error handling standardized
- [ ] Code cleanup done

## 🟢 Medium Priority (Do Third)

### Cost & Optimization
- [ ] Fluid compute enabled
- [ ] Usage management configured
- [ ] ISR revalidation optimized
- [ ] Large media files moved

### Documentation
- [ ] API docs created
- [ ] Runbooks written
- [ ] Architecture documented
- [ ] README updated

---

## Quick Commands

```bash
# Pre-launch checks
npm test              # Run tests
npm run lint          # Check linting
npm run build         # Verify build
tsc --noEmit          # Check types

# Deployment
vercel --prod         # Deploy to production
vercel env ls         # Check environment variables

# Monitoring
# Check Sentry dashboard
# Check Vercel Analytics
# Check health endpoint
```

---

**Full Checklist:** See `PRODUCTION_LAUNCH_CHECKLIST.md`

