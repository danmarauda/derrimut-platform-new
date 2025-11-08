# Incident Response Plan - Derrimut Platform

**Version:** 1.0.0
**Last Updated:** January 9, 2025

---

## Severity Levels

### P0 - Critical (Response: Immediate)
**Examples:**
- Complete service outage (site down)
- Security breach or data leak
- Database corruption with data loss
- Payment processing completely broken (100% failure)
- Authentication system completely broken

**Response Time:** Immediate (24/7)
**Escalation:** CTO, CEO
**Communication:** Hourly updates

---

### P1 - High (Response: 1 hour)
**Examples:**
- Major feature broken (>50% users affected)
- Performance degradation (>2x normal response times)
- Error rate >10% sustained
- Payment processing failure rate >50%
- Partial service outage

**Response Time:** 1 hour (business hours), 4 hours (after hours)
**Escalation:** Engineering Lead
**Communication:** Every 2 hours

---

### P2 - Medium (Response: 4 hours)
**Examples:**
- Minor feature broken (<10% users affected)
- Non-critical errors (1-10% error rate)
- Performance issues isolated to specific features
- UI/UX issues not affecting functionality

**Response Time:** 4 hours (business hours), next business day (after hours)
**Escalation:** None (unless becomes P1)
**Communication:** Daily updates

---

### P3 - Low (Response: Next sprint)
**Examples:**
- Minor bugs
- Cosmetic issues
- Feature requests
- Documentation updates

**Response Time:** Next sprint planning
**Escalation:** None
**Communication:** Via backlog

---

## Incident Response Workflow

```
1. DETECTION
   ↓
2. TRIAGE → Severity Level → P0/P1/P2/P3
   ↓
3. NOTIFICATION
   ↓
4. INVESTIGATION
   ↓
5. MITIGATION
   ↓
6. RESOLUTION
   ↓
7. POST-MORTEM
```

---

## Phase 1: Detection & Triage

### Detection Methods

**Automated Monitoring:**
- Sentry error alerts
- Vercel deployment failures
- Uptime monitoring (future)
- Stripe webhook delivery failures

**User Reports:**
- Support tickets
- Email: support@derrimut247.com.au
- Social media
- Direct contact

**Internal Discovery:**
- Team testing
- Routine health checks
- Deployment verification

### Triage Checklist

```bash
# Quick Assessment Questions:

1. Is the site accessible?
   curl https://derrimut247.com.au

2. Can users login?
   Test: Visit /sign-in

3. Are payments working?
   Check: Stripe dashboard

4. What's the error rate?
   Check: Sentry dashboard

5. How many users affected?
   Check: Analytics

# Severity Decision Matrix:
- All users affected + critical feature → P0
- >50% users affected + major feature → P1
- <10% users affected + minor feature → P2
- Cosmetic/minor → P3
```

---

## Phase 2: Notification

### P0 - Critical Incident

**Immediate Actions (First 5 minutes):**

```
1. Create incident channel in Slack
   Channel name: #incident-YYYYMMDD-brief-description
   Invite: @engineering @cto @product-lead

2. Post incident alert
   Template:
   🚨 P0 CRITICAL INCIDENT

   Issue: [One sentence description]
   Impact: [User impact - e.g., "All users cannot login"]
   Detected: [Timestamp]
   Status: Investigating
   Incident Commander: [Name]

   Updates every hour.

3. Notify via multiple channels
   - Slack: #incident, #engineering, @channel
   - Email: engineering@derrimut247.com.au
   - Phone: On-call engineer, CTO
   - SMS: CTO (if no response in 5 min)

4. Assign Incident Commander
   - First engineer to respond owns incident
   - Coordinates all response activities
```

### P1 - High Priority

```
1. Create incident thread in #engineering

2. Post incident alert
   🔴 P1 HIGH PRIORITY INCIDENT

   Issue: [Description]
   Impact: [User impact]
   Detected: [Timestamp]
   Owner: [Name]

   Updates every 2 hours.

3. Notify stakeholders
   - Slack: #engineering
   - Email: Engineering Lead

4. Assign owner
   - Engineer working on issue
```

### P2/P3 - Lower Priority

```
1. Create ticket in issue tracker

2. Assign to appropriate team member

3. Notify via Slack #engineering

4. No immediate escalation required
```

---

## Phase 3: Investigation

### Investigation Checklist

```bash
# STEP 1: Gather Information
- What changed recently?
  git log --oneline --since="1 day ago"

- When did issue start?
  Check: Sentry first error timestamp

- Is it affecting all users or specific users?
  Check: User reports, analytics

- Can you reproduce the issue?
  Test: In development, staging

# STEP 2: Check System Health
- Vercel deployment status
- Convex function execution
- Stripe webhook delivery
- Clerk authentication

# STEP 3: Review Logs
- Sentry error logs
- Convex function logs: npx convex logs
- Vercel deployment logs
- Browser console (for frontend issues)

# STEP 4: Identify Root Cause
- Review recent commits
- Check recent deployments
- Review recent config changes
- Check third-party service status
  - Vercel: vercel.com/status
  - Convex: convex.dev/status
  - Clerk: clerk.com/status
  - Stripe: status.stripe.com
```

---

## Phase 4: Mitigation

### Immediate Mitigation Options

**Option 1: Rollback Deployment**
```bash
# Use when: Recent deployment caused issue
# Time: 5 minutes
# See: ROLLBACK_PLAN.md

# Quick rollback:
1. Vercel Dashboard → Deployments
2. Select last stable deployment
3. Click "Promote to Production"
```

**Option 2: Disable Problematic Feature**
```bash
# Use when: Specific feature causing issues
# Time: 10 minutes

# Example: Disable AI plan generator
1. Add feature flag in code
2. Deploy hotfix with feature disabled
3. Monitor error rates
```

**Option 3: Restore Database**
```bash
# Use when: Database corruption
# Time: 20-30 minutes
# Requires: CTO approval
# See: BACKUP_STRATEGY.md

# Quick restore:
1. Convex Dashboard → Backups
2. Select backup before issue
3. Restore to production
```

**Option 4: Fix Environment Variables**
```bash
# Use when: Config issue
# Time: 5 minutes

1. Vercel Dashboard → Settings → Env Variables
2. Update incorrect variable
3. Redeploy: vercel --prod
```

**Option 5: Enable Maintenance Mode**
```bash
# Use when: Need time to fix without user impact
# Time: 2 minutes

1. Vercel Dashboard → Project Settings
2. Add redirect: /* → /maintenance.html
3. Fix issue
4. Remove redirect
```

---

## Phase 5: Resolution

### Resolution Checklist

**For P0/P1 Incidents:**

```bash
# STEP 1: Implement Fix
- Develop fix in feature branch
- Test thoroughly in development
- Deploy to staging
- Verify fix works

# STEP 2: Deploy to Production
- Follow DEPLOYMENT_CHECKLIST.md
- Monitor deployment closely
- Watch error rates in Sentry

# STEP 3: Verify Resolution
- Test affected user flows
- Check error rates (should drop to <1%)
- Verify user reports stop
- Monitor for 30 minutes

# STEP 4: Communicate Resolution
# Post in incident channel:
✅ INCIDENT RESOLVED

Issue: [Description]
Root Cause: [Brief explanation]
Fix: [What was done]
Deployed: [Timestamp]
Verification: All systems normal
Monitoring: Ongoing for next 24 hours

Post-mortem scheduled: [Date/Time]

# STEP 5: Close Incident
- Mark incident as resolved
- Archive incident channel (keep for reference)
- Update status page (if applicable)
```

---

## Phase 6: Post-Mortem

### Post-Mortem Meeting (Within 48 hours)

**Attendees:**
- Incident Commander
- Engineering team involved
- Engineering Lead
- Product Lead (if customer-facing)
- CTO (for P0 incidents)

**Agenda (60 minutes):**

1. **Timeline Review (15 min)**
   - When was issue detected?
   - How long to triage?
   - How long to mitigation?
   - How long to resolution?
   - Total incident duration?

2. **Root Cause Analysis (20 min)**
   - What caused the incident?
   - Why wasn't it caught earlier?
   - Were there warning signs?

3. **Response Evaluation (15 min)**
   - What went well?
   - What could be improved?
   - Were runbooks helpful?
   - Was communication effective?

4. **Action Items (10 min)**
   - Prevention: How to prevent recurrence?
   - Detection: How to detect faster?
   - Response: How to respond faster?
   - Documentation: What needs updating?

### Post-Mortem Template

```markdown
# Incident Post-Mortem: [Brief Description]

**Date:** [Date]
**Severity:** P0/P1/P2
**Duration:** [Hours/Minutes]
**Impact:** [Users affected, features impacted]

## Timeline

| Time | Event |
|------|-------|
| 14:00 | Issue detected via Sentry alert |
| 14:05 | Incident declared, team notified |
| 14:15 | Root cause identified |
| 14:20 | Mitigation deployed (rollback) |
| 14:25 | Issue resolved, monitoring |
| 14:55 | Incident closed |

## Root Cause

[Detailed explanation of what caused the incident]

## Impact

- **Users Affected:** [Number/Percentage]
- **Duration:** [Time]
- **Features Impacted:** [List]
- **Revenue Impact:** [If applicable]

## What Went Well

1. Fast detection (5 minutes)
2. Clear communication in Slack
3. Rollback executed smoothly

## What Could Be Improved

1. Earlier detection (need better monitoring)
2. Faster root cause identification
3. Update runbooks with this scenario

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Add monitoring for [X] | Engineer | 2025-01-15 | Pending |
| Update deployment checklist | Eng Lead | 2025-01-12 | Pending |
| Improve testing for [Y] | QA | 2025-01-20 | Pending |

## Lessons Learned

[Key takeaways for the team]
```

---

## Communication Templates

### Status Update Template

```
📊 INCIDENT UPDATE [#3 - 15:30]

Status: Investigating / Mitigating / Resolved
Progress: [Brief description of progress]
Next Update: [Time]
ETA to Resolution: [Estimate or "Unknown"]
```

### Resolution Notification

```
✅ INCIDENT RESOLVED

Issue: [One sentence]
Resolution: [What was done]
Verification: [How we confirmed fix]
Impact: [Users/features affected]
Post-mortem: [When scheduled]

Thank you for your patience.
```

---

## Escalation Paths

### P0 Escalation

```
Issue Detected
     ↓
On-Call Engineer (Immediate)
     ↓ (if no response in 5 min)
Engineering Lead (Phone + SMS)
     ↓ (if no resolution in 15 min)
CTO (Phone + SMS)
     ↓ (if security incident or data breach)
CEO (Phone)
```

### P1 Escalation

```
Issue Detected
     ↓
Engineer on Duty (1 hour)
     ↓ (if no progress in 2 hours)
Engineering Lead (Email + Slack)
     ↓ (if no resolution in 4 hours)
CTO (Slack + Email)
```

---

## Emergency Contacts

### On-Call Rotation

**Current Week:** [Name] - [Phone] - [Email]

**Backup:** [Name] - [Phone] - [Email]

### Escalation Contacts

**Engineering Lead:** [Email] - [Phone]
**CTO:** [Email] - [Phone]
**CEO:** [Email] - [Phone] (P0 only)

### Communication Channels

**Primary:** Slack #incidents
**Secondary:** Email engineering@derrimut247.com.au
**Emergency:** Phone (see above)

---

## Incident Log

| Date | Severity | Issue | Duration | Root Cause | Resolution |
|------|----------|-------|----------|------------|------------|
| 2025-01-09 | Example | Example issue | 30 min | Config error | Fixed env var |

---

## Related Documentation

- [Rollback Plan](./ROLLBACK_PLAN.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Backup Strategy](./BACKUP_STRATEGY.md)
- [Runbooks](./docs/RUNBOOKS.md)

---

**Document Version:** 1.0.0
**Last Updated:** January 9, 2025
**Next Review:** February 9, 2025
