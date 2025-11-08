# DNS Migration Plan - Derrimut Platform

**Version:** 1.0.0
**Last Updated:** January 9, 2025

---

## Overview

This document outlines the plan for migrating DNS for the Derrimut Platform to Vercel, ensuring zero-downtime transition.

---

## Pre-Migration

### 1. Document Current DNS Configuration

**Current Provider:** [Provider Name]
**Domain:** derrimut247.com.au

**Current Records:**
```
# Document all existing DNS records
Type    Name    Value                   TTL
A       @       [Current IP]            3600
CNAME   www     [Current target]        3600
MX      @       [Mail server]           3600
TXT     @       [SPF/DMARC/etc]         3600
```

**Action:** Export DNS zone file as backup

```bash
# Save current configuration
# File: dns-backup-derrimut247-20250109.txt
```

### 2. Test DNS Changes in Staging

**Staging Domain:** staging-derrimut247.vercel.app

**Steps:**
1. Create staging subdomain
2. Configure Vercel DNS for staging
3. Test all critical paths
4. Verify email delivery (if applicable)
5. Measure page load times

### 3. Plan Maintenance Window

**Recommended:** Low-traffic period
**Suggested:** Sunday 2:00 AM - 4:00 AM AEDT

**Rationale:**
- Lowest user activity
- 2-hour window for any issues
- Business hours backup (Mon 9 AM) if major issues

---

## Migration Steps

### Phase 1: Add Domain to Vercel (No DNS changes yet)

**Duration:** 10 minutes

```bash
# STEP 1: Access Vercel Dashboard
# Navigate to: https://vercel.com/derrimut/derrimut-platform

# STEP 2: Add Custom Domain
# Go to: Project Settings → Domains
# Click: "Add Domain"
# Enter: derrimut247.com.au
# Click: "Add"

# STEP 3: Note DNS Instructions
# Vercel will show required DNS records:

Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com

# STEP 4: Leave Vercel Dashboard Open
# DO NOT apply DNS changes yet
```

### Phase 2: Lower TTL (24-48 hours before migration)

**Purpose:** Reduce DNS propagation time

```bash
# STEP 1: Access Current DNS Provider
# Login to DNS management panel

# STEP 2: Lower TTL for all records
# Change TTL from 3600 (1 hour) to 300 (5 minutes)

# Records to update:
A record (@): TTL = 300
CNAME record (www): TTL = 300

# STEP 3: Wait 24-48 hours
# This allows old TTL to expire globally
```

### Phase 3: Update DNS Records

**Duration:** 15 minutes
**Executed during maintenance window**

```bash
# STEP 1: Communicate Maintenance
# Post in Slack: #general
# Message:
# "📋 Scheduled Maintenance
# When: Sunday, Jan 15, 2:00 AM - 4:00 AM AEDT
# Impact: Possible brief connection issues
# What: DNS migration to improved infrastructure
# Updates: Every 30 minutes"

# STEP 2: Create Backup
# Export current DNS configuration
# Save locally and in cloud storage

# STEP 3: Update A Record
# Login to DNS provider
# Update A record:
Old: A @ [Current IP] TTL 300
New: A @ 76.76.21.21 TTL 300

# Save changes

# STEP 4: Update CNAME Record
# Update www CNAME:
Old: CNAME www [Current target] TTL 300
New: CNAME www cname.vercel-dns.com TTL 300

# Save changes

# STEP 5: Preserve Email Records (if applicable)
# DO NOT change MX, SPF, DMARC records
# These should remain unchanged

# STEP 6: Verify Changes in DNS Provider
# Confirm updates are saved
# Check dashboard shows new values
```

### Phase 4: Verification

**Duration:** 30 minutes
**Critical:** Do not end maintenance window until verified

```bash
# STEP 1: Check DNS Propagation (Immediate)
# Use multiple DNS checkers:
dig derrimut247.com.au @8.8.8.8
dig derrimut247.com.au @1.1.1.1

# Expected: A record shows 76.76.21.21

# STEP 2: Check from Multiple Locations
# Use: whatsmydns.net
# Enter: derrimut247.com.au
# Type: A
# Verify: Majority showing new IP

# STEP 3: Test Website Accessibility
# Visit from multiple devices:
curl -I https://derrimut247.com.au
# Expected: HTTP/2 200

# Browser test:
# https://derrimut247.com.au
# Expected: Site loads correctly

# STEP 4: Test WWW Redirect
curl -I https://www.derrimut247.com.au
# Expected: Redirect to https://derrimut247.com.au

# STEP 5: Test SSL Certificate
curl -vI https://derrimut247.com.au 2>&1 | grep -i "issuer"
# Expected: Let's Encrypt certificate

# STEP 6: Test Critical User Flows
# - Login
# - Membership page
# - Trainer booking
# - Marketplace
# - AI plan generator

# STEP 7: Monitor Error Rates
# Check Sentry dashboard
# Expected: No spike in errors
# Acceptable: <1% error rate

# STEP 8: Check Vercel Deployment
# Vercel Dashboard → Domains
# Status should show: "Valid Configuration ✓"
```

### Phase 5: Post-Migration Monitoring

**Duration:** 24 hours intensive, 7 days monitoring

```bash
# First Hour: Every 15 minutes
# Check:
- Site accessibility
- Error rates (Sentry)
- User reports
- DNS propagation status

# First 24 Hours: Every hour
# Monitor:
- Traffic patterns (Vercel Analytics)
- Error rates
- Performance metrics
- User feedback

# First Week: Daily
# Review:
- DNS propagation globally
- SSL certificate status
- Performance vs. pre-migration
- User reports

# After 1 Week: Increase TTL
# Change TTL back to 3600 (1 hour)
# Improves performance and reduces DNS queries
```

---

## Rollback Plan

### If Migration Fails

**Trigger Rollback If:**
- Site completely inaccessible for >10 minutes
- Error rate >10%
- Critical feature completely broken
- SSL certificate fails to provision

**Rollback Procedure:**

```bash
# IMMEDIATE ACTION

# STEP 1: Revert DNS Records
# Login to DNS provider
# Change A record back to original IP
# Change CNAME back to original target

# STEP 2: Verify Rollback
dig derrimut247.com.au
# Should show original IP

# STEP 3: Test Site
curl -I https://derrimut247.com.au
# Should be accessible

# STEP 4: Communicate Rollback
# Slack #general:
# "DNS migration rolled back due to [issue].
# Site should be accessible normally.
# New migration scheduled: [date/time]"

# STEP 5: Investigate Issue
# Determine why migration failed
# Fix before attempting again
```

---

## Email Considerations

### Preserve Email Functionality

**Important:** DNS changes should NOT affect email

**MX Records:** Do NOT change
**SPF/DMARC:** Do NOT change

**Verify after migration:**
```bash
# Check MX records unchanged
dig MX derrimut247.com.au

# Send test email
# To: test@derrimut247.com.au
# Verify: Email delivered successfully
```

---

## Communication Plan

### Pre-Migration (24 hours before)

**Channels:**
- Email: All team members
- Slack: #general, #engineering

**Message:**
```
📋 DNS Migration Notice

When: Sunday, Jan 15, 2:00 AM - 4:00 AM AEDT
Duration: Up to 2 hours
Impact: Possible brief connection issues during migration

What's happening:
We're migrating DNS to improved infrastructure for better performance and reliability.

What you might notice:
- Brief connection issues (1-2 minutes)
- Possible SSL certificate warnings (temporary)

What to do:
- Avoid critical operations during maintenance window
- Report any issues to #engineering

Updates will be posted every 30 minutes.
```

### During Migration (Every 30 minutes)

```
🔄 Migration Update [2:30 AM]

Status: In Progress
Progress: DNS records updated
Next: Verification in progress
ETA: 30 minutes
```

### Post-Migration (Immediately)

```
✅ Migration Complete

Status: Successful
Duration: 45 minutes
Impact: No user reports
Performance: Normal

Monitoring will continue for next 24 hours.
Thank you for your patience!
```

---

## DNS Record Reference

### Target Configuration (Vercel)

```dns
# Root domain
Type: A
Name: @
Value: 76.76.21.21
TTL: 300 (initially), 3600 (after successful migration)

# WWW subdomain
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300 (initially), 3600 (after successful migration)

# Email (DO NOT CHANGE)
Type: MX
Name: @
Value: [Current mail server]
Priority: [Current priority]
TTL: 3600

# Email security (DO NOT CHANGE)
Type: TXT
Name: @
Value: [SPF record]
TTL: 3600

Type: TXT
Name: _dmarc
Value: [DMARC policy]
TTL: 3600
```

---

## Testing Checklist

### Pre-Migration Testing (Staging)

- [ ] Staging domain configured in Vercel
- [ ] DNS records configured for staging
- [ ] Staging site accessible
- [ ] SSL certificate issued for staging
- [ ] Critical flows tested on staging
- [ ] Performance benchmarked on staging

### Post-Migration Testing (Production)

- [ ] Root domain (derrimut247.com.au) accessible
- [ ] WWW subdomain redirects correctly
- [ ] SSL certificate valid (HTTPS)
- [ ] No browser security warnings
- [ ] Login functionality works
- [ ] Membership page loads
- [ ] Trainer booking accessible
- [ ] Marketplace loads products
- [ ] AI plan generator works
- [ ] Admin dashboard accessible (for admins)
- [ ] Email delivery working (if applicable)
- [ ] DNS propagated globally (check 5+ locations)

---

## Troubleshooting

### Issue: Site Not Accessible After Migration

**Check:**
```bash
# 1. Verify DNS propagated
dig derrimut247.com.au @8.8.8.8

# 2. Check Vercel configuration
# Vercel Dashboard → Domains
# Status should be "Valid"

# 3. Check deployment
# Vercel Dashboard → Deployments
# Latest deployment should be successful

# 4. Test direct Vercel URL
curl -I https://derrimut-platform.vercel.app
# If this works, DNS issue
# If this fails, deployment issue
```

### Issue: SSL Certificate Not Provisioning

**Wait:** SSL can take up to 60 minutes to provision

**Check:**
```bash
# Vercel Dashboard → Domains → [domain]
# Certificate status should show "Valid"

# If stuck on "Pending":
# 1. Verify DNS propagated correctly
# 2. Wait longer (up to 60 min)
# 3. Contact Vercel support if still pending
```

### Issue: Some Users Can't Access Site

**Cause:** DNS caching

**Solution:**
```bash
# Users should:
# 1. Clear browser cache
# 2. Flush DNS cache:

# Windows:
ipconfig /flushdns

# macOS:
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Linux:
sudo systemd-resolve --flush-caches
```

---

## Success Criteria

**Migration Successful When:**
- ✅ Site accessible via derrimut247.com.au
- ✅ WWW redirects to root domain
- ✅ SSL certificate valid (HTTPS)
- ✅ DNS propagated globally (95%+ locations)
- ✅ No increase in error rates
- ✅ Performance equal or better than pre-migration
- ✅ Email delivery unaffected (if applicable)
- ✅ No critical user reports

---

## Related Documentation

- [Vercel Configuration](./VERCEL_CONFIGURATION.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Rollback Plan](./ROLLBACK_PLAN.md)

---

**Document Version:** 1.0.0
**Last Updated:** January 9, 2025
