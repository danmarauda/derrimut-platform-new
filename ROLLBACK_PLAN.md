# Rollback Plan - Derrimut Platform

**Version:** 1.0.0
**Last Updated:** January 9, 2025

---

## Overview

This document defines the procedures for rolling back deployments when issues are detected in production or staging environments. Follow these procedures carefully to minimize downtime and data loss.

---

## When to Rollback

### Immediate Rollback (P0 - Critical)

**Execute rollback immediately without approval:**

- ✅ Complete service outage (site completely down)
- ✅ Critical security vulnerability discovered
- ✅ Database corruption or data loss
- ✅ Payment processing completely broken (100% failure rate)
- ✅ User authentication completely broken (cannot login)

### Rollback with Approval (P1 - High)

**Execute rollback after consulting Engineering Lead:**

- ⚠️ Major feature broken affecting >50% of users
- ⚠️ Performance degradation (response times >2x normal)
- ⚠️ Error rate >10% sustained for >15 minutes
- ⚠️ Payment processing failure rate >50%
- ⚠️ Data integrity issues (wrong data displayed)

### Consider Hotfix Instead (P2 - Medium)

**Evaluate whether hotfix is faster than rollback:**

- 🔧 Minor feature broken affecting <10% of users
- 🔧 UI/UX issues not affecting functionality
- 🔧 Non-critical errors (error rate 1-10%)
- 🔧 Performance issues isolated to specific features
- 🔧 Simple configuration errors

---

## Rollback Procedures

### Procedure 1: Vercel Deployment Rollback

**Duration:** 5 minutes
**Downtime:** Minimal (< 1 minute)
**Impact:** Reverts application code to previous version

```bash
# STEP 1: Access Vercel Dashboard
# Navigate to: https://vercel.com/derrimut/derrimut-platform

# STEP 2: Go to Deployments
# Click "Deployments" in left sidebar

# STEP 3: Identify last stable deployment
# Look for:
# - Deployment marked with ✓ (successful)
# - Timestamp BEFORE issue started
# - "Production" badge (if rolling back production)
# - Review deployment preview to confirm it's correct version

# STEP 4: Promote to Production
# Click on the stable deployment
# Click "Promote to Production" button
# Click "Promote" to confirm

# STEP 5: Monitor rollback
# Wait for deployment to complete (1-2 minutes)
# Watch for "Deployment Ready" message

# STEP 6: Verify rollback successful
# Check application health
curl https://derrimut247.com.au/api/health

# Check error rate in Sentry
# Expected: Error rate decreased

# Test critical flows
# - User login
# - Membership page loads
# - Trainer booking accessible
```

**Success Criteria:**
- ✅ Deployment completes without errors
- ✅ Health endpoint returns 200 OK
- ✅ Error rate decreased to normal levels (< 1%)
- ✅ Critical user flows functional

---

### Procedure 2: Convex Backend Rollback

**Duration:** 10 minutes
**Downtime:** Minimal (< 2 minutes)
**Impact:** Reverts backend functions and schema

```bash
# ⚠️ WARNING: This rolls back database schema changes
# Ensure data compatibility before executing

# STEP 1: Access Convex Dashboard
npx convex dashboard

# STEP 2: Navigate to Deployments
# Click "Deployments" in left sidebar

# STEP 3: Identify last stable deployment
# Find deployment before issue started
# Check deployment timestamp
# Review deployment details

# STEP 4: Rollback deployment
# Click on stable deployment
# Click "Rollback to this deployment"
# Confirm action

# STEP 5: Wait for rollback to complete
# Monitor progress in dashboard
# Expected: 1-2 minutes

# STEP 6: Verify functions working
# Check Functions tab in Convex dashboard
# Verify no errors in execution logs

# STEP 7: Test backend functionality
# Test queries:
npx convex query users:getUserByClerkId '{"clerkId":"test_user_id"}'

# Check for errors in response
```

**Success Criteria:**
- ✅ Rollback completes without errors
- ✅ Functions executing normally
- ✅ Queries returning expected results
- ✅ No schema incompatibility errors

---

### Procedure 3: Database Restore from Backup

**Duration:** 20-30 minutes
**Downtime:** 10-20 minutes (application in maintenance mode)
**Impact:** Restores database to backup point (data loss possible)

```bash
# ⚠️ CRITICAL: This is a destructive operation
# ⚠️ Data created after backup timestamp will be lost
# ⚠️ Requires CTO approval

# STEP 1: Enable Maintenance Mode
# Redirect all traffic to maintenance page
# Vercel Dashboard → Project Settings → Redirects
# Add redirect: /* → /maintenance.html (307)

# STEP 2: Notify stakeholders
# Slack: #incidents
# Message: "Database restore in progress. ETA: 30 minutes"

# STEP 3: Access Convex Dashboard
npx convex dashboard

# STEP 4: Navigate to Backups
# Settings → Backups

# STEP 5: Select backup to restore
# Choose backup timestamp before issue
# Review backup details:
#   - Timestamp
#   - Table counts
#   - Backup size

# STEP 6: Confirm restore point
# Verify this is correct backup
# Calculate data loss window:
#   Data loss = Current time - Backup timestamp

# STEP 7: Execute restore
# Click "Restore from Backup"
# Enter confirmation text
# Click "Restore" to confirm

# STEP 8: Monitor restore progress
# Watch progress bar in dashboard
# Expected duration: 10-20 minutes
# Do NOT interrupt process

# STEP 9: Verify database integrity
# After restore completes, verify critical tables:

# Check users table
# Query for sample users
# Verify records exist

# Check memberships table
# Query for active subscriptions
# Verify data correct

# Check recent orders
# Verify recent transactions present

# STEP 10: Test application functionality
# Test all critical flows (see checklist below)

# STEP 11: Disable Maintenance Mode
# Remove redirect in Vercel
# Monitor error rates for 15 minutes

# STEP 12: Communicate restoration complete
# Slack: #incidents
# Message: "Database restored successfully. Monitoring for issues."
```

**Success Criteria:**
- ✅ Restore completes without errors
- ✅ Critical tables verified
- ✅ Application functional
- ✅ No ongoing errors

**Post-Restore Actions:**
- Document data loss window
- Identify affected users (if any)
- Plan data recovery (if possible)
- Communicate data loss to stakeholders

---

### Procedure 4: Environment Variable Rollback

**Duration:** 5 minutes
**Downtime:** None (triggers redeployment)
**Impact:** Reverts environment variable values

```bash
# Use when: Environment variable change caused issue

# STEP 1: Access Vercel Dashboard
# Navigate to: https://vercel.com/derrimut/derrimut-platform

# STEP 2: Go to Settings → Environment Variables

# STEP 3: Identify changed variable
# Review recent changes (sort by "Last Updated")

# STEP 4: Revert to previous value
# Edit variable
# Enter previous value
# Save changes

# STEP 5: Trigger redeployment
# Vercel will automatically redeploy with new env vars
# Or manually redeploy:
vercel --prod

# STEP 6: Verify variable updated
vercel env ls

# STEP 7: Monitor for issue resolution
# Check error rates
# Test affected functionality
```

---

## Rollback Decision Matrix

| Issue | Severity | Action | Approval Required |
|-------|----------|--------|-------------------|
| Site completely down | P0 | Immediate Vercel rollback | No (notify after) |
| Security vulnerability | P0 | Immediate Vercel rollback | No (notify after) |
| Database corruption | P0 | Database restore | Yes (CTO) |
| Payment 100% failing | P0 | Immediate rollback | No (notify after) |
| Auth completely broken | P0 | Immediate rollback | No (notify after) |
| Error rate >10% | P1 | Rollback | Yes (Eng Lead) |
| Major feature broken | P1 | Rollback or hotfix | Yes (Eng Lead) |
| Performance degradation | P1 | Rollback or hotfix | Yes (Eng Lead) |
| Minor feature broken | P2 | Hotfix preferred | No |
| UI/UX issues | P2 | Hotfix next sprint | No |

---

## Post-Rollback Checklist

### Immediate (0-15 minutes)

- [ ] **Verify rollback successful**
  - Application accessible
  - Critical flows working
  - Error rate decreased

- [ ] **Monitor error rates**
  - Check Sentry
  - Expected: < 1% error rate

- [ ] **Test critical flows**
  - User login
  - Membership page
  - Trainer booking
  - Marketplace
  - AI plan generator

- [ ] **Document issue**
  - Create incident ticket
  - Record timeline of events
  - Document rollback actions taken

### Short-term (15 minutes - 1 hour)

- [ ] **Notify stakeholders**
  - Engineering team (Slack: #incidents)
  - Product team
  - Customer support (if customer impact)

- [ ] **Investigate root cause**
  - Review error logs
  - Identify what caused issue
  - Determine if data loss occurred

- [ ] **Plan fix**
  - Create hotfix plan
  - Schedule development work
  - Set timeline for fix deployment

### Long-term (1-24 hours)

- [ ] **Post-mortem meeting**
  - Schedule within 24 hours
  - Invite: Engineering team, Product lead
  - Agenda: Root cause, prevention, process improvement

- [ ] **Update documentation**
  - Document lessons learned
  - Update rollback procedures if needed
  - Add to knowledge base

- [ ] **Fix and redeploy**
  - Develop fix
  - Test thoroughly in staging
  - Deploy with monitoring

---

## Testing After Rollback

### Critical Flow Tests

**User Authentication:**
- [ ] Can sign in with email/password
- [ ] Can sign in with Google
- [ ] Session persists after refresh
- [ ] Can sign out

**Membership:**
- [ ] Membership page loads
- [ ] Tiers displayed correctly
- [ ] Stripe checkout accessible
- [ ] Membership status accurate for existing users

**Trainer Booking:**
- [ ] Trainer list loads
- [ ] Can select trainer
- [ ] Can choose date/time
- [ ] Stripe checkout accessible

**Marketplace:**
- [ ] Products display
- [ ] Can add to cart
- [ ] Cart persists
- [ ] Checkout accessible

**Admin Dashboard:**
- [ ] Dashboard loads (admin users)
- [ ] User list loads
- [ ] Organizations list loads
- [ ] Reports accessible

---

## Rollback Communication Template

### Slack Message Template

```
🚨 INCIDENT ALERT - Rollback in Progress

Issue: [Brief description]
Severity: P0/P1/P2
Action: Rolling back to deployment [deployment ID]
Expected Completion: [ETA]
Impact: [User impact description]
Status Updates: Will update every 15 minutes

@engineering-lead @cto
```

### Follow-up Message

```
✅ ROLLBACK COMPLETE

Rolled back to: [deployment ID]
Completion Time: [timestamp]
Status: Application stable
Current Error Rate: [X%]
Next Steps: Root cause investigation, hotfix planning

Post-mortem scheduled: [date/time]
```

---

## Rollback Log

### Template

| Date | Environment | Reason | Method | Duration | Data Loss | Deployed By | Approved By |
|------|-------------|--------|--------|----------|-----------|-------------|-------------|
| 2025-01-09 | Production | Example | Vercel | 5 min | None | Dev Name | Lead Name |

---

## Emergency Contacts

### Rollback Approval Authority

**P0 (No approval required, notify immediately):**
- Engineering Lead: [Email] [Phone]
- CTO: [Email] [Phone]
- On-Call Engineer: [Phone]

**P1 (Requires Engineering Lead approval):**
- Engineering Lead: [Email] [Phone]

**Database Restore (Requires CTO approval):**
- CTO: [Email] [Phone]

### Communication Channels

- **Incidents:** Slack #incidents
- **Engineering:** Slack #engineering
- **Email:** engineering@derrimut247.com.au

---

## Related Documentation

- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Runbooks](./docs/RUNBOOKS.md)
- [Incident Response Plan](./INCIDENT_RESPONSE_PLAN.md)
- [Backup Strategy](./BACKUP_STRATEGY.md)

---

**Document Version:** 1.0.0
**Last Updated:** January 9, 2025
**Next Review:** February 9, 2025
