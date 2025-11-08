# Operational Runbooks - Derrimut Platform

**Version:** 1.0.0
**Last Updated:** January 9, 2025
**Maintainer:** Development Team

---

## Table of Contents

1. [Common Operations](#common-operations)
2. [Deployment Operations](#deployment-operations)
3. [Database Operations](#database-operations)
4. [Troubleshooting](#troubleshooting)
5. [Emergency Procedures](#emergency-procedures)
6. [Monitoring & Alerts](#monitoring--alerts)

---

## Common Operations

### Daily Health Check

**Frequency:** Daily (automated via monitoring)
**Duration:** 5 minutes

```bash
# 1. Check application health
curl https://derrimut-platform.vercel.app/api/health

# 2. Check Convex backend status
npx convex dashboard
# Navigate to "Functions" → Check execution count

# 3. Verify Stripe webhook delivery
# Go to Stripe Dashboard → Developers → Webhooks
# Check "Recent webhook attempts" for failures

# 4. Check error rates in Sentry
# Go to Sentry Dashboard → Issues
# Review new issues and error trends
```

**Expected Results:**
- Health endpoint returns 200 OK
- Convex functions executing normally
- No failed Stripe webhooks (< 1% failure rate acceptable)
- No critical errors in Sentry (P0/P1 errors need immediate attention)

---

### Verify Database Integrity

**Frequency:** Weekly
**Duration:** 10 minutes

```bash
# 1. Connect to Convex dashboard
npx convex dashboard

# 2. Check table row counts
# Tables should have expected growth patterns:
# - users: Steady growth (daily signups)
# - memberships: Match active users
# - bookings: Growth with seasonality
# - orders: Consistent with sales activity

# 3. Check for orphaned records
# Run these queries in Convex dashboard:

# Find users without memberships (should be new signups)
# Query: users without matching membership records

# Find bookings without valid trainer IDs
# Query: bookings with missing trainer references

# Find orders without valid user IDs
# Query: orders with missing user references
```

**Red Flags:**
- Sudden spike or drop in table counts
- High percentage of orphaned records (> 5%)
- Missing critical data relationships

---

### Backup Verification

**Frequency:** Weekly
**Duration:** 15 minutes

```bash
# 1. Verify Convex automatic backups
# Go to Convex Dashboard → Settings → Backups
# Check last backup timestamp (should be < 24 hours ago)

# 2. Test environment variable backup
# Verify .env.local is backed up in password manager
# Check that all production env vars are documented

# 3. Test code backup
# Verify latest commits are pushed to GitHub
git log --oneline -10
git push --dry-run

# 4. Test rollback capability (staging only)
# Redeploy previous version to staging
vercel --prod --scope=derrimut-staging
```

**Success Criteria:**
- All backups timestamp within 24 hours
- Environment variables recoverable from secure storage
- Code repository up-to-date with production

---

## Deployment Operations

### Deploy to Staging

**Frequency:** As needed
**Duration:** 5-10 minutes
**Prerequisites:** All tests passing, code reviewed

```bash
# 1. Ensure you're on staging branch
git checkout staging
git pull origin staging

# 2. Merge latest changes (if needed)
git merge main
# Resolve any conflicts

# 3. Run quality checks
npm run lint
npm run typecheck
npm run test

# 4. Build locally to verify
npm run build

# 5. Deploy to staging
git push origin staging

# 6. Verify deployment
# Wait for Vercel deployment to complete
# Check deployment logs in Vercel dashboard

# 7. Smoke test staging
# Visit https://staging.derrimut247.com.au
# Test critical flows:
# - User login
# - Membership purchase (test mode)
# - Trainer booking (test mode)
# - Product purchase (test mode)
```

**Rollback Procedure:**
If deployment fails, see [Rollback Deployment](#rollback-deployment)

---

### Deploy to Production

**Frequency:** Weekly (or as needed for hotfixes)
**Duration:** 15-20 minutes
**Prerequisites:** Staging tested, stakeholder approval

```bash
# 1. Final verification on staging
# Complete smoke tests
# Review Sentry for any staging errors
# Get approval from product owner

# 2. Ensure main branch is ready
git checkout main
git pull origin main

# 3. Run full test suite
npm run lint
npm run typecheck
npm run test
npm run build

# 4. Tag the release
git tag -a v1.0.x -m "Release version 1.0.x - [Brief description]"
git push origin v1.0.x

# 5. Deploy to production
git push origin main

# 6. Monitor deployment
# Watch Vercel deployment logs
# Monitor Sentry for errors (first 15 minutes critical)
# Check Slack/email for automated alerts

# 7. Verify production
# Visit https://derrimut247.com.au
# Test critical flows (with real payment methods in test mode if possible)
# - User login
# - Membership page loads
# - Trainer booking page loads
# - Marketplace loads

# 8. Post-deployment verification
# Check analytics for traffic patterns
# Verify webhook delivery in Stripe
# Monitor Convex function execution rates
```

**Success Criteria:**
- Deployment completes without errors
- No spike in error rates (< 1% error rate)
- Critical user flows functional
- No alerts triggered

---

### Rollback Deployment

**When to Execute:**
- Critical errors in production (P0)
- Service unavailable
- Data integrity issues
- Unrecoverable application crashes

**Duration:** 5 minutes
**Impact:** Brief downtime during rollback

```bash
# IMMEDIATE ACTION REQUIRED

# 1. Access Vercel Dashboard
# Go to https://vercel.com/derrimut/derrimut-platform

# 2. Navigate to Deployments
# Click "Deployments" in left sidebar

# 3. Find last stable deployment
# Identify the previous working deployment
# Look for deployments marked with ✓ (successful)
# Check timestamp before issue started

# 4. Promote to Production
# Click on the stable deployment
# Click "Promote to Production" button
# Confirm rollback

# 5. Verify rollback successful
# Wait for deployment to complete (2-3 minutes)
# Check application health
curl https://derrimut247.com.au/api/health

# 6. Monitor error rates
# Check Sentry for reduced errors
# Verify critical flows working

# 7. Communicate rollback
# Notify team via Slack: #engineering
# Update incident ticket with rollback details
# Document root cause for post-mortem
```

**Post-Rollback:**
- Investigate root cause of failure
- Fix issues in development environment
- Test thoroughly in staging
- Schedule new deployment

---

## Database Operations

### Export Database Backup (Convex)

**Frequency:** Before major migrations
**Duration:** 10 minutes

```bash
# 1. Access Convex Dashboard
npx convex dashboard

# 2. Navigate to Settings → Backups
# Click "Create Manual Backup"
# Add description: "Pre-migration backup - [date]"

# 3. Wait for backup to complete
# Download backup file for offline storage

# 4. Store backup securely
# Upload to secure cloud storage (Google Drive/Dropbox)
# Document backup location in password manager
```

---

### Restore from Backup

**When to Execute:**
- Data corruption detected
- Accidental data deletion
- Failed migration

**Duration:** 20-30 minutes
**Impact:** Application downtime during restore

```bash
# ⚠️ CRITICAL OPERATION - REQUIRES APPROVAL

# 1. Stop all writes to database
# Enable maintenance mode in Vercel
# Redirect users to maintenance page

# 2. Access Convex Dashboard
npx convex dashboard

# 3. Navigate to Settings → Backups
# Select backup to restore
# Choose restore point (timestamp)

# 4. Confirm restore operation
# Click "Restore from Backup"
# Confirm action (irreversible)

# 5. Wait for restore to complete
# Monitor progress in dashboard

# 6. Verify data integrity
# Check critical tables:
# - users (sample records)
# - memberships (active subscriptions)
# - bookings (upcoming sessions)
# - orders (recent purchases)

# 7. Re-enable application
# Disable maintenance mode
# Monitor error rates

# 8. Notify stakeholders
# Send all-clear notification
# Document restore in incident log
```

---

### Database Migration

**Frequency:** As needed for schema changes
**Duration:** Varies (test in staging first)

```bash
# 1. Test migration in development
# Make schema changes in convex/schema.ts
npx convex dev
# Verify migration successful

# 2. Create backup before migration (staging)
# See "Export Database Backup" section

# 3. Deploy to staging
git push origin staging
# Monitor migration in Convex dashboard

# 4. Verify migration in staging
# Test all affected queries/mutations
# Run data validation scripts

# 5. Create production backup
# See "Export Database Backup" section

# 6. Deploy to production
git push origin main

# 7. Monitor migration
# Watch Convex dashboard for migration progress
# Check error logs for any failures

# 8. Verify data integrity
# Run validation queries
# Test affected features
```

---

## Troubleshooting

### Payment Failures

**Symptom:** User reports payment not processing

**Investigation Steps:**

```bash
# 1. Check Stripe Dashboard
# Go to https://dashboard.stripe.com
# Navigate to Payments → Search for customer email
# Check payment status and error message

# 2. Verify webhook delivery
# Go to Stripe Dashboard → Developers → Webhooks
# Find webhook endpoint
# Check "Recent webhook attempts"
# Look for failed deliveries related to customer

# 3. Check Sentry for errors
# Go to Sentry Dashboard
# Search for errors around payment timestamp
# Look for Stripe API errors or webhook processing errors

# 4. Check user's subscription status
npx convex dashboard
# Query memberships table for user's clerkId
# Verify subscription status

# 5. Check Stripe subscription status
# In Stripe Dashboard, find customer
# Verify subscription is active
# Check for payment method issues
```

**Common Causes & Solutions:**

| Issue | Cause | Solution |
|-------|-------|----------|
| Webhook not received | Endpoint unreachable | Verify webhook URL in Stripe, check Vercel deployment status |
| Payment method declined | Insufficient funds / Expired card | Contact user to update payment method |
| Subscription not created | Metadata missing | Check checkout session has clerkId in metadata |
| Database not updated | Webhook processing error | Check Sentry logs, manually trigger webhook replay in Stripe |

---

### User Login Issues

**Symptom:** User cannot sign in / Sign in redirects fail

**Investigation Steps:**

```bash
# 1. Check Clerk status
# Go to https://clerk.com/status
# Verify no ongoing incidents

# 2. Verify environment variables
# Check that Clerk keys are correct in Vercel
vercel env ls

# 3. Check middleware configuration
# Verify middleware.ts is correctly configured
# Ensure protected routes are defined

# 4. Check user's account status in Clerk
# Go to Clerk Dashboard → Users
# Search for user by email
# Verify account is not locked/suspended

# 5. Clear browser cache (ask user to try)
# Incognito/Private mode
# Different browser
```

**Common Causes & Solutions:**

| Issue | Cause | Solution |
|-------|-------|----------|
| Redirect loop | Middleware misconfiguration | Check publicRoutes in middleware.ts |
| Session expired | Token timeout | Ask user to sign in again |
| Account locked | Too many failed attempts | Unlock in Clerk Dashboard |
| Environment mismatch | Dev keys in production | Verify production env vars |

---

### AI Plan Generation Fails

**Symptom:** User completes voice consultation but no plan generated

**Investigation Steps:**

```bash
# 1. Check Vapi webhook logs
# Go to Vapi Dashboard → Workflows
# Find workflow by ID: e13b1b19-3cd5-42ab-ba5d-7c46bf989a6e
# Check recent webhook calls and responses

# 2. Check Convex logs
npx convex logs
# Look for /vapi/generate-program endpoint calls
# Check for errors in plan creation

# 3. Verify Gemini API status
# Check Google AI status page
# Verify GEMINI_API_KEY is valid

# 4. Check Convex HTTP endpoint
# Verify /vapi/generate-program is deployed
npx convex dashboard
# Navigate to HTTP Routes

# 5. Test plan creation manually
# Use Vapi testing interface to send test request
# Check response and error messages
```

**Common Causes & Solutions:**

| Issue | Cause | Solution |
|-------|-------|----------|
| No plan created | Vapi workflow not calling Convex | Check Vapi workflow configuration |
| Gemini API error | Rate limit / Invalid key | Check API quota, verify API key |
| Invalid data format | AI response doesn't match schema | Review validateWorkoutPlan/validateDietPlan functions |
| User not found | ClerkId mismatch | Verify user_id passed from Vapi matches Clerk |

---

### Trainer Booking Not Created

**Symptom:** Payment successful but booking not showing in user profile

**Investigation Steps:**

```bash
# 1. Check Stripe webhook delivery
# Verify checkout.session.completed event was received
# Check webhook logs in Stripe Dashboard

# 2. Check Convex logs
npx convex logs
# Look for handleBookingPayment function
# Check for errors during booking creation

# 3. Verify booking in database
npx convex dashboard
# Query bookings table
# Filter by paymentSessionId (from Stripe)

# 4. Check session metadata
# In Stripe Dashboard, find checkout session
# Verify metadata contains:
#   - userId (clerkId)
#   - trainerId
#   - sessionType
#   - sessionDate
#   - startTime
#   - duration

# 5. Check for validation errors
# Review booking creation mutation logs
# Verify all required fields present
```

**Common Causes & Solutions:**

| Issue | Cause | Solution |
|-------|-------|----------|
| Booking not created | Webhook failed | Manually replay webhook from Stripe |
| Missing metadata | Checkout session missing data | Verify booking flow passes metadata |
| Invalid trainer ID | Trainer not found | Verify trainer exists in database |
| Date validation error | Invalid date format | Check date format is "YYYY-MM-DD" |

---

### Marketplace Order Not Created

**Symptom:** Payment successful but order not showing in profile

**Investigation Steps:**

```bash
# 1. Check Stripe webhook delivery
# Verify checkout.session.completed event was received

# 2. Check Convex logs
npx convex logs
# Look for handleMarketplaceOrder function
# Check for errors during order creation

# 3. Verify order in database
npx convex dashboard
# Query orders table
# Filter by stripeSessionId

# 4. Check cart contents
# Verify user had items in cart before checkout
# Query cart table for user's clerkId

# 5. Check shipping address
# Verify session metadata contains shippingAddress
# Check address was properly parsed as JSON
```

**Common Causes & Solutions:**

| Issue | Cause | Solution |
|-------|-------|----------|
| Order not created | Empty cart | Verify cart items exist before checkout |
| Missing shipping address | Metadata not passed | Check checkout flow includes shipping address |
| JSON parse error | Invalid address format | Verify address is stringified JSON |
| Inventory insufficient | Stock depleted | Check product inventory levels |

---

## Emergency Procedures

### Complete Service Outage

**Severity:** P0 - Critical
**Response Time:** Immediate

```bash
# IMMEDIATE ACTIONS

# 1. Verify outage scope
curl https://derrimut247.com.au/api/health
# Check multiple endpoints to isolate issue

# 2. Check Vercel status
# Go to https://vercel.com/status
# Check for platform-wide incidents

# 3. Check recent deployments
# Access Vercel Dashboard → Deployments
# Check if recent deployment caused issue

# 4. Rollback to last stable version
# See "Rollback Deployment" section above
# Execute immediately if recent deployment caused outage

# 5. Check external dependencies
# - Clerk status: https://clerk.com/status
# - Convex status: https://convex.dev/status
# - Stripe status: https://status.stripe.com

# 6. Enable maintenance mode (if needed)
# Create maintenance page in Vercel
# Redirect all traffic to maintenance page

# 7. Notify stakeholders
# Post in Slack: #incidents
# Email: engineering@derrimut247.com.au
# Update status page if available

# 8. Investigate root cause
# Review error logs in Sentry
# Check Convex function execution logs
# Review recent code changes

# 9. Document incident
# Create incident report
# Timeline of events
# Root cause analysis
# Remediation steps
```

---

### Data Breach Suspected

**Severity:** P0 - Critical
**Response Time:** Immediate

```bash
# ⚠️ CRITICAL SECURITY INCIDENT

# 1. IMMEDIATELY ISOLATE
# Do NOT investigate via application
# Do NOT alert attacker

# 2. Preserve evidence
# Do NOT modify logs
# Do NOT deploy new code
# Screenshot suspicious activity

# 3. Notify security team
# Email: security@derrimut247.com.au
# Escalate to CTO immediately

# 4. Rotate all credentials (after consulting security team)
# - Clerk API keys
# - Stripe API keys
# - Convex deployment keys
# - Database access credentials
# - Environment variables

# 5. Review access logs
# Clerk Dashboard → Security → Activity Logs
# Convex Dashboard → Logs
# Vercel → Deployments → Logs

# 6. Assess impact
# Determine what data was accessed
# Identify affected users
# Document timeline

# 7. Follow incident response plan
# See INCIDENT_RESPONSE_PLAN.md
```

---

### Database Corruption

**Severity:** P1 - High
**Response Time:** 1 hour

```bash
# 1. Verify corruption scope
# Access Convex Dashboard
# Check affected tables
# Sample random records to assess damage

# 2. Stop writes (if severe)
# Enable read-only mode if possible
# Or enable maintenance mode

# 3. Assess backup availability
# Check last backup timestamp
# Verify backup integrity

# 4. Determine restore strategy
# Calculate data loss window (time since last backup)
# Assess if partial restore needed

# 5. Execute restore (if needed)
# See "Restore from Backup" section
# Requires approval from CTO

# 6. Investigate root cause
# Check recent migrations
# Review function execution logs
# Identify corruption source

# 7. Prevent recurrence
# Fix root cause
# Add validation checks
# Increase backup frequency if needed
```

---

## Monitoring & Alerts

### Sentry Alert Response

**Alert:** High error rate detected
**Response Time:** 30 minutes

```bash
# 1. Access Sentry Dashboard
# Go to Sentry project
# Review "Issues" page

# 2. Triage errors
# Group by error type
# Identify most frequent errors
# Check error trends (spike or steady?)

# 3. Investigate top errors
# Click on error to see details
# Review stack trace
# Check affected users (anonymized)
# Identify common patterns

# 4. Assess severity
# P0: Blocking critical flows → Immediate fix
# P1: Affecting multiple users → Fix within 24h
# P2: Edge cases → Schedule for sprint

# 5. Create hotfix (if P0/P1)
# Create branch from main
# Fix error
# Test thoroughly
# Deploy to staging → production

# 6. Monitor error resolution
# Verify error rate decreases
# Mark issue as resolved in Sentry
```

---

### Stripe Webhook Failure Alert

**Alert:** Webhook delivery failing
**Response Time:** 1 hour

```bash
# 1. Check Stripe Dashboard
# Navigate to Developers → Webhooks
# Review failed webhook attempts

# 2. Identify failure pattern
# Check error messages
# Note which events are failing
# Check if all events failing or specific ones

# 3. Verify endpoint availability
curl -X POST https://your-convex.convex.site/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "ping"}'

# 4. Check Convex logs
npx convex logs
# Look for webhook processing errors

# 5. Fix endpoint issues
# If endpoint down: Check Convex deployment
# If signature verification failing: Verify STRIPE_WEBHOOK_SECRET
# If processing errors: Fix error in webhook handler

# 6. Replay failed webhooks
# In Stripe Dashboard, find failed webhooks
# Click "Retry" for each failed event
# Or use API to replay in bulk

# 7. Monitor webhook delivery
# Verify success rate returns to 100%
```

---

### Performance Degradation Alert

**Alert:** Slow response times detected
**Response Time:** 2 hours

```bash
# 1. Check Vercel Analytics
# Navigate to Vercel Dashboard → Analytics
# Review response time graphs
# Identify affected routes

# 2. Check Convex function performance
npx convex dashboard
# Navigate to Functions
# Sort by execution time
# Identify slow functions

# 3. Review recent changes
# Check if performance degraded after deployment
git log --oneline --since="1 day ago"

# 4. Analyze slow functions
# Review database queries
# Check for N+1 queries
# Look for missing indexes

# 5. Optimize (if needed)
# Add database indexes
# Optimize queries
# Add caching where appropriate

# 6. Deploy optimization
# Test in staging first
# Deploy to production
# Monitor performance improvement
```

---

## Maintenance Schedule

### Daily
- [x] Monitor Sentry for new errors
- [x] Review Stripe webhook delivery
- [x] Check application health endpoint

### Weekly
- [x] Verify database integrity
- [x] Review backup status
- [x] Check performance metrics
- [x] Review security logs

### Monthly
- [x] Review incident response plan
- [x] Update runbooks with lessons learned
- [x] Audit user access and permissions
- [x] Review and rotate API keys (if needed)

---

## Contact Information

### Emergency Contacts

**Critical Issues (P0):**
- CTO: [Email]
- Engineering Lead: [Email]
- On-Call Engineer: [Phone]

**Security Incidents:**
- Security Team: security@derrimut247.com.au
- CTO: [Email]

**Communication Channels:**
- Slack: #incidents (P0), #engineering (all issues)
- Email: engineering@derrimut247.com.au

---

## Additional Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Incident Response Plan](../INCIDENT_RESPONSE_PLAN.md)
- [Deployment Checklist](../DEPLOYMENT_CHECKLIST.md)
- [Rollback Plan](../ROLLBACK_PLAN.md)

---

**Document Version:** 1.0.0
**Last Updated:** January 9, 2025
**Next Review:** February 9, 2025
