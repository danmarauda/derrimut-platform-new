# Deployment Checklist - Derrimut Platform

**Version:** 1.0.0
**Last Updated:** January 9, 2025

---

## Overview

This checklist ensures safe and successful deployments to staging and production environments. Follow each step carefully and check off items as completed.

---

## Pre-Deployment Checklist

### Code Quality ✅

- [ ] **All tests pass**
  ```bash
  npm run test
  # Expected: All tests passing (0 failures)
  ```

- [ ] **Build succeeds without errors**
  ```bash
  npm run build
  # Expected: Build completed successfully
  # Check for: No TypeScript errors, no build failures
  ```

- [ ] **TypeScript compiles without errors**
  ```bash
  npm run typecheck
  # Expected: No type errors
  ```

- [ ] **Linting passes**
  ```bash
  npm run lint
  # Expected: No linting errors
  ```

- [ ] **No console.log statements** in production code
  ```bash
  # Search for console.log in source files
  grep -r "console.log" src/
  # Expected: Only in development utilities
  ```

- [ ] **Code reviewed and approved**
  - PR approved by at least one team member
  - All review comments addressed
  - No outstanding merge conflicts

### Environment Variables ✅

- [ ] **All required environment variables set**
  ```bash
  # Check Vercel environment variables
  vercel env ls
  ```

  Required variables:
  - `CONVEX_DEPLOYMENT`
  - `NEXT_PUBLIC_CONVEX_URL`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `CLERK_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `GEMINI_API_KEY`
  - `NEXT_PUBLIC_VAPI_API_KEY`
  - `NEXT_PUBLIC_VAPI_WORKFLOW_ID`

- [ ] **Environment-specific values verified**
  - Staging uses staging Convex deployment
  - Production uses production Convex deployment
  - Stripe keys match environment (test vs. live)

- [ ] **No hardcoded secrets in code**
  ```bash
  # Search for potential secrets
  grep -r "sk_live" src/
  grep -r "pk_live" src/
  # Expected: No results
  ```

### Database Migrations ✅

- [ ] **Convex schema changes deployed**
  ```bash
  # Deploy Convex changes
  npx convex deploy --prod
  ```

- [ ] **Schema changes backward compatible**
  - No breaking changes to existing data
  - Migration plan documented if breaking changes needed

- [ ] **Database backup created** (for production)
  - Manual backup created before migration
  - Backup timestamp recorded

- [ ] **Migration tested in staging**
  - Schema changes deployed to staging
  - Verified no errors in Convex dashboard
  - Tested affected queries/mutations

### Third-Party Services ✅

- [ ] **Stripe configured correctly**
  - [ ] Webhook endpoint set: `https://[convex-url].convex.site/stripe-webhook`
  - [ ] Webhook secret environment variable set
  - [ ] All events enabled:
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `checkout.session.completed`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`

- [ ] **Clerk configured correctly**
  - [ ] Webhook endpoint set: `https://[domain].vercel.app/api/clerk-webhook`
  - [ ] Production URLs whitelisted
  - [ ] All events enabled:
    - `user.created`
    - `user.updated`
    - `organization.created`
    - `organization.updated`
    - `organizationMembership.created`
    - `organizationMembership.deleted`

- [ ] **Vapi configured correctly**
  - [ ] Workflow ID matches environment variable
  - [ ] Convex HTTP endpoint URL updated in workflow
  - [ ] Voice agent tested with sample calls

- [ ] **Google Gemini API**
  - [ ] API key valid and active
  - [ ] Quota sufficient for expected usage
  - [ ] Billing enabled

### Documentation ✅

- [ ] **README.md updated**
  - Deployment instructions current
  - Environment variables documented
  - Contact information updated

- [ ] **CHANGELOG.md updated**
  - New version number
  - Features added
  - Bugs fixed
  - Breaking changes (if any)

- [ ] **API documentation updated** (if API changes)
  - New endpoints documented
  - Changed endpoints updated
  - Examples provided

### Testing ✅

- [ ] **Unit tests pass**
  ```bash
  npm run test:unit
  ```

- [ ] **Integration tests pass**
  ```bash
  npm run test:integration
  ```

- [ ] **E2E tests pass (critical flows)**
  - [ ] User signup and login
  - [ ] Membership purchase flow
  - [ ] Trainer booking flow
  - [ ] Marketplace checkout flow
  - [ ] AI plan generation flow

- [ ] **Manual smoke tests completed**
  - [ ] All pages load without errors
  - [ ] Forms submit successfully
  - [ ] Images display correctly
  - [ ] Navigation works

---

## Deployment Checklist

### Staging Deployment 🚀

**Responsible:** Developer
**Approver:** Engineering Lead

- [ ] **Merge to staging branch**
  ```bash
  git checkout staging
  git merge main
  git push origin staging
  ```

- [ ] **Verify Vercel deployment started**
  - Check Vercel dashboard
  - Monitor build logs
  - Wait for deployment to complete (~2-3 minutes)

- [ ] **Check deployment status**
  - Status: Deployment successful
  - No build errors
  - No deployment warnings

- [ ] **Run smoke tests on staging**
  - Visit: `https://staging.derrimut247.com.au`
  - Test critical flows (see checklist below)

- [ ] **Verify logs for errors**
  ```bash
  # Check Convex logs
  npx convex logs --environment staging

  # Check Vercel logs
  # Visit Vercel Dashboard → Deployments → [deployment] → Logs
  ```

- [ ] **Get approval for production**
  - Product owner approval
  - Engineering lead approval
  - No critical issues found

### Production Deployment 🚀

**Responsible:** Engineering Lead
**Approver:** CTO

- [ ] **Create release tag**
  ```bash
  git tag -a v1.0.x -m "Release v1.0.x - [Brief description]"
  git push origin v1.0.x
  ```

- [ ] **Final production backup**
  - Create manual Convex backup
  - Document backup timestamp
  - Verify backup successful

- [ ] **Deploy to production**
  ```bash
  git checkout main
  git push origin main
  ```

- [ ] **Monitor deployment**
  - Watch Vercel deployment logs
  - Check for any errors
  - Wait for deployment completion (~3-5 minutes)

- [ ] **Verify deployment success**
  - Status: Deployment successful
  - Production URL accessible: `https://derrimut247.com.au`
  - SSL certificate valid

- [ ] **Check health endpoint**
  ```bash
  curl https://derrimut247.com.au/api/health
  # Expected: 200 OK
  ```

---

## Post-Deployment Checklist

### Immediate Verification (0-15 minutes) ✅

- [ ] **Critical user flows working**
  - [ ] User login successful
  - [ ] Membership page loads correctly
  - [ ] Trainer booking page accessible
  - [ ] Marketplace loads products
  - [ ] AI plan generator initializes

- [ ] **Test payment flow (test mode)**
  - [ ] Create test membership checkout
  - [ ] Verify Stripe checkout loads
  - [ ] Cancel checkout (don't complete payment)

- [ ] **Monitor error rates**
  - Check Sentry for spike in errors
  - Expected: < 1% error rate
  - No critical (P0) errors

- [ ] **Verify webhook delivery**
  - Stripe Dashboard → Webhooks → Check recent attempts
  - Expected: 100% delivery success rate

- [ ] **Check Convex function execution**
  - Convex Dashboard → Functions
  - Verify functions executing normally
  - No errors in logs

### Short-term Monitoring (15 minutes - 1 hour) ✅

- [ ] **Monitor error rates**
  - Check Sentry every 15 minutes
  - Investigate any new errors
  - Verify error rate remains < 1%

- [ ] **Check performance metrics**
  - Vercel Analytics → Response times
  - Expected: < 300ms average
  - No significant degradation

- [ ] **Verify real user traffic**
  - Vercel Analytics → Traffic
  - Verify users accessing site
  - Check bounce rate normal

- [ ] **Test complete user journey**
  - Complete a full membership signup (test mode)
  - Complete a trainer booking (test mode)
  - Complete a product purchase (test mode)

### Long-term Monitoring (1-24 hours) ✅

- [ ] **Daily health check**
  - Run daily health check script
  - Verify all systems operational

- [ ] **Review error logs**
  - Sentry → Review issues
  - Address any new P1/P2 issues
  - Update documentation if needed

- [ ] **Check database integrity**
  - Spot-check critical tables
  - Verify data relationships intact
  - No orphaned records

- [ ] **Performance monitoring**
  - Review Vercel Analytics
  - Check for performance regressions
  - Investigate any slow endpoints

### Communication ✅

- [ ] **Notify stakeholders**
  - [ ] Engineering team (Slack: #engineering)
  - [ ] Product team
  - [ ] Customer support (if customer-facing changes)

- [ ] **Update deployment log**
  - Record deployment timestamp
  - Document any issues encountered
  - Note rollback plan (if applicable)

- [ ] **Update status page** (if applicable)
  - Mark deployment complete
  - Clear any maintenance messages

---

## Critical Flow Smoke Tests

### User Authentication Flow ✅

- [ ] Visit homepage
- [ ] Click "Sign In"
- [ ] Enter credentials (or use test account)
- [ ] Successfully logged in
- [ ] Redirected to dashboard
- [ ] User name displayed correctly

### Membership Purchase Flow ✅

- [ ] Navigate to /membership
- [ ] View membership tiers
- [ ] Select a tier
- [ ] Click "Subscribe"
- [ ] Redirected to Stripe checkout
- [ ] Stripe checkout loads correctly
- [ ] (Don't complete payment in production)

### Trainer Booking Flow ✅

- [ ] Navigate to /trainer-booking
- [ ] View available trainers
- [ ] Select a trainer
- [ ] Choose date and time
- [ ] Click "Book Session"
- [ ] Redirected to Stripe checkout
- [ ] Stripe checkout loads with correct amount

### Marketplace Flow ✅

- [ ] Navigate to /marketplace
- [ ] Browse products
- [ ] Add product to cart
- [ ] View cart
- [ ] Click "Checkout"
- [ ] Enter shipping address
- [ ] Redirected to Stripe checkout
- [ ] Stripe checkout shows cart items

### AI Plan Generation Flow ✅

- [ ] Navigate to /generate-program
- [ ] Click "Start Voice Consultation"
- [ ] Vapi voice call initializes
- [ ] Microphone access granted
- [ ] Voice agent responds
- [ ] (Optionally complete full conversation)
- [ ] End call
- [ ] Verify redirect to profile (if completed)

### Admin Dashboard Flow ✅

- [ ] Login as admin user
- [ ] Navigate to /admin
- [ ] View dashboard statistics
- [ ] Navigate to /admin/users
- [ ] User list loads
- [ ] Navigate to /admin/organizations
- [ ] Organization list loads

---

## Rollback Criteria

**Trigger rollback immediately if:**

- [ ] Critical user flow completely broken (cannot login, cannot purchase)
- [ ] Error rate > 10% for > 5 minutes
- [ ] Database corruption detected
- [ ] Payment processing failing (> 50% failure rate)
- [ ] Security vulnerability discovered

**Rollback Procedure:**
See [ROLLBACK_PLAN.md](./ROLLBACK_PLAN.md)

---

## Deployment Approval

### Staging Deployment

**Deployed by:** __________________________ **Date:** __________

**Approved by:** __________________________ **Date:** __________

### Production Deployment

**Deployed by:** __________________________ **Date:** __________

**Engineering Lead Approval:** __________________________ **Date:** __________

**CTO Approval (if major release):** __________________________ **Date:** __________

---

## Post-Deployment Notes

### Issues Encountered

_Document any issues found during or after deployment:_

1.
2.
3.

### Resolutions

_Document how issues were resolved:_

1.
2.
3.

### Lessons Learned

_Document learnings for future deployments:_

1.
2.
3.

---

## Related Documentation

- [Rollback Plan](./ROLLBACK_PLAN.md)
- [Runbooks](./docs/RUNBOOKS.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Incident Response Plan](./INCIDENT_RESPONSE_PLAN.md)

---

**Checklist Version:** 1.0.0
**Last Updated:** January 9, 2025
**Next Review:** February 9, 2025
