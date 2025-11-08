# Backup Strategy - Derrimut Platform

**Version:** 1.0.0
**Last Updated:** January 9, 2025

---

## Overview

This document outlines the comprehensive backup strategy for the Derrimut Platform, ensuring data protection, business continuity, and rapid disaster recovery.

---

## Table of Contents

1. [Backup Scope](#backup-scope)
2. [Backup Types](#backup-types)
3. [Backup Schedule](#backup-schedule)
4. [Backup Procedures](#backup-procedures)
5. [Restoration Procedures](#restoration-procedures)
6. [Testing & Verification](#testing--verification)
7. [Retention Policies](#retention-policies)
8. [Storage Locations](#storage-locations)

---

## Backup Scope

### What We Back Up

#### 1. Database (Convex)
**Priority:** Critical
**Frequency:** Automated daily + Manual before major changes

- All tables (26 tables)
- Indexes
- Schema definitions
- Function code

#### 2. Application Code (GitHub)
**Priority:** Critical
**Frequency:** Real-time (continuous)

- Source code
- Configuration files
- Environment variable templates
- Documentation

#### 3. Environment Variables (Vercel + Secure Storage)
**Priority:** Critical
**Frequency:** After each change

- Production environment variables
- Staging environment variables
- Development environment variables
- API keys and secrets

#### 4. Third-Party Configuration
**Priority:** High
**Frequency:** After each change

- Clerk settings
- Stripe webhooks configuration
- Vapi workflow configuration
- Gemini API settings

### What's Not Backed Up (Managed by Providers)

- **Vercel Deployments:** Retained by Vercel
- **Clerk User Data:** Managed by Clerk
- **Stripe Data:** Managed by Stripe
- **Static Assets:** Rebuilt from source on deployment

---

## Backup Types

### Automated Backups

#### Convex Database Backups
**Provider:** Convex
**Frequency:** Daily
**Retention:** 30 days
**Location:** Convex infrastructure

```
Automated Schedule:
- Daily: 00:00 UTC (11:00 AM Melbourne time)
- Retention: 30 days
- Storage: Convex-managed
```

**Features:**
- Point-in-time recovery
- Automatic encryption at rest
- Cross-region replication
- No action required

#### Code Repository Backups
**Provider:** GitHub
**Frequency:** Real-time
**Retention:** Infinite (Git history)
**Location:** GitHub servers + Local clones

```
Git Workflow:
- Continuous: Every commit pushed to GitHub
- Branches: main, staging, feature/*
- Tags: Release tags (v1.0.0, v1.0.1, etc.)
```

### Manual Backups

#### Pre-Deployment Database Backup
**Trigger:** Before production deployments
**Frequency:** As needed
**Retention:** 90 days

```bash
# Create manual backup in Convex Dashboard
# Settings → Backups → Create Manual Backup
# Label: "Pre-deployment backup - v1.0.x - [date]"
```

#### Pre-Migration Database Backup
**Trigger:** Before schema changes
**Frequency:** As needed
**Retention:** 90 days

```bash
# Create manual backup before migration
# Label: "Pre-migration backup - [migration description] - [date]"
```

#### Environment Variable Snapshots
**Trigger:** After any change
**Frequency:** As needed
**Retention:** Infinite

```bash
# Export current environment variables
vercel env ls > env-backup-$(date +%Y%m%d).txt

# Store in secure location (1Password, AWS Secrets Manager, etc.)
```

---

## Backup Schedule

### Daily Backups (Automated)

| Time (UTC) | Time (Melbourne) | Backup Type | Retention |
|-----------|------------------|-------------|-----------|
| 00:00 | 11:00 AM | Convex Database | 30 days |

### Weekly Tasks (Manual)

**Every Monday 9:00 AM Melbourne:**
- [ ] Verify last automated backup successful
- [ ] Test one random backup restoration (staging)
- [ ] Review backup storage usage
- [ ] Audit environment variable backups

### Monthly Tasks (Manual)

**First Monday of each month:**
- [ ] Full backup verification test
- [ ] Review and update backup retention policies
- [ ] Audit backup access permissions
- [ ] Test full disaster recovery procedure (staging)

### Ad-Hoc Backups (Manual)

**Trigger events:**
- Before production deployments
- Before database migrations
- Before major feature releases
- After security incidents
- Before infrastructure changes

---

## Backup Procedures

### Procedure 1: Manual Convex Database Backup

**Duration:** 2 minutes
**Frequency:** Before deployments, migrations

```bash
# STEP 1: Access Convex Dashboard
npx convex dashboard

# STEP 2: Navigate to Backups
# Click "Settings" → "Backups"

# STEP 3: Create Manual Backup
# Click "Create Manual Backup" button

# STEP 4: Add Description
# Enter descriptive label:
# Format: "[Purpose] - [Version/Description] - [Date]"
# Examples:
#   "Pre-deployment backup - v1.0.5 - 2025-01-09"
#   "Pre-migration backup - Add salary table - 2025-01-09"
#   "Pre-release backup - New AI features - 2025-01-09"

# STEP 5: Confirm Creation
# Click "Create Backup"

# STEP 6: Wait for Completion
# Backup typically completes in 1-2 minutes
# Wait for status: "Backup Complete"

# STEP 7: Verify Backup Created
# Check backup appears in list
# Note backup ID and timestamp

# STEP 8: Document Backup
# Record in backup log:
#   - Backup ID
#   - Timestamp
#   - Purpose
#   - Created by
```

**Success Criteria:**
- ✅ Backup appears in Convex dashboard
- ✅ Status shows "Complete"
- ✅ Backup ID documented

---

### Procedure 2: Environment Variable Backup

**Duration:** 5 minutes
**Frequency:** After any env var change

```bash
# STEP 1: Export Production Variables
vercel env ls --environment production > backups/env-prod-$(date +%Y%m%d).txt

# STEP 2: Export Staging Variables
vercel env ls --environment preview > backups/env-staging-$(date +%Y%m%d).txt

# STEP 3: Create Secure Backup Document
# Create new entry in password manager (1Password, LastPass, etc.)
# Title: "Derrimut Platform - Environment Variables - [Date]"

# STEP 4: Document Each Variable
# For each variable, record:
#   - Variable name
#   - Environment (production/staging)
#   - Value (encrypted)
#   - Purpose/description
#   - Last updated date

# Example structure:
# NEXT_PUBLIC_CONVEX_URL
# Environment: Production
# Value: https://spotted-gerbil-236.convex.cloud
# Purpose: Convex backend URL
# Updated: 2025-01-09

# STEP 5: Test Recovery
# Verify you can access backup
# Verify values are readable

# STEP 6: Store Backup File
# Upload to secure cloud storage (Google Drive, Dropbox)
# Folder: Derrimut/Backups/Environment Variables/
# Set access permissions: Eng Lead + CTO only

# STEP 7: Document Backup Location
# Add entry to backup log:
#   - Backup date
#   - Storage location
#   - Access instructions
#   - Created by
```

**Success Criteria:**
- ✅ All env vars documented
- ✅ Backup accessible by authorized personnel
- ✅ Recovery tested successfully

---

### Procedure 3: Third-Party Configuration Backup

**Duration:** 10 minutes
**Frequency:** After configuration changes

```bash
# STRIPE CONFIGURATION

# STEP 1: Document Webhook Settings
# Go to Stripe Dashboard → Developers → Webhooks
# For each webhook endpoint, record:
#   - Endpoint URL
#   - Description
#   - Events enabled (list all)
#   - API version
#   - Status (enabled/disabled)

# STEP 2: Document Product/Price Settings
# Go to Stripe Dashboard → Products
# For each membership tier, record:
#   - Product ID
#   - Product name
#   - Price ID
#   - Price amount
#   - Currency (AUD)
#   - Billing interval

# CLERK CONFIGURATION

# STEP 3: Document Clerk Settings
# Go to Clerk Dashboard → Settings
# Record:
#   - Application ID
#   - Instance URL
#   - Authentication providers enabled
#   - Redirect URLs
#   - Webhook endpoints

# STEP 4: Document Clerk Webhooks
# Go to Clerk Dashboard → Webhooks
# For each webhook, record:
#   - Endpoint URL
#   - Events subscribed
#   - Signing secret (store securely)

# VAPI CONFIGURATION

# STEP 5: Document Vapi Workflow
# Go to Vapi Dashboard → Workflows
# Record:
#   - Workflow ID: e13b1b19-3cd5-42ab-ba5d-7c46bf989a6e
#   - Workflow name
#   - Voice agent settings
#   - Function calling endpoints
#   - Variables passed (user_id, full_name)

# STEP 6: Store Configuration Backup
# Save all documentation in secure location
# Password manager or encrypted Google Doc
# Title: "Derrimut Platform - Third-Party Configuration - [Date]"
```

---

## Restoration Procedures

### Procedure 1: Restore Convex Database

**Duration:** 20-30 minutes
**Downtime:** 10-20 minutes
**Impact:** Data loss = Current time - Backup timestamp

```bash
# ⚠️ CRITICAL: This is a destructive operation
# ⚠️ Requires CTO approval
# ⚠️ Data created after backup will be lost

# STEP 1: Assess Situation
# Determine:
#   - What data is corrupted/lost?
#   - When did issue occur?
#   - Which backup to restore?
#   - Data loss window acceptable?

# STEP 2: Get Approval
# Contact: CTO
# Provide:
#   - Issue description
#   - Proposed backup timestamp
#   - Data loss window
#   - Business impact

# STEP 3: Enable Maintenance Mode
# See ROLLBACK_PLAN.md for procedure
# Vercel Dashboard → Redirects → Add /* → /maintenance.html

# STEP 4: Notify Stakeholders
# Slack: #incidents
# Message: "Database restore in progress. Downtime: ~20 minutes"

# STEP 5: Access Convex Dashboard
npx convex dashboard

# STEP 6: Navigate to Backups
# Settings → Backups

# STEP 7: Select Backup
# Choose backup by timestamp
# Verify:
#   - Timestamp before issue
#   - Backup status: Complete
#   - Reasonable data loss window

# STEP 8: Preview Backup (if available)
# Review backup details:
#   - Table counts
#   - Backup size
#   - Creation date

# STEP 9: Execute Restore
# Click "Restore from Backup"
# Enter confirmation: Type backup ID
# Click "Confirm Restore"

# STEP 10: Monitor Restoration
# Watch progress bar
# Do NOT close browser or interrupt
# Expected: 10-20 minutes

# STEP 11: Verify Restoration
# After completion, verify critical tables:

# Check users table
# Query: Count users, spot-check records

# Check memberships table
# Query: Count active memberships

# Check recent data
# Verify recent bookings, orders, etc. present

# STEP 12: Test Application
# Run smoke tests (see DEPLOYMENT_CHECKLIST.md)
# Verify critical flows working

# STEP 13: Disable Maintenance Mode
# Remove redirect in Vercel

# STEP 14: Monitor Application
# Check error rates for 30 minutes
# Monitor user reports

# STEP 15: Document Restoration
# Incident report:
#   - Issue description
#   - Backup timestamp used
#   - Data loss window
#   - Restoration duration
#   - Post-restoration status
```

**Success Criteria:**
- ✅ Restoration completes without errors
- ✅ Critical data verified present
- ✅ Application functional
- ✅ Error rates normal

---

### Procedure 2: Restore Environment Variables

**Duration:** 10 minutes
**Downtime:** None (triggers redeployment)

```bash
# STEP 1: Access Backup
# Retrieve env var backup from secure storage
# (Password manager, Google Drive, etc.)

# STEP 2: Access Vercel Dashboard
# Navigate to: https://vercel.com/derrimut/derrimut-platform
# Go to Settings → Environment Variables

# STEP 3: Restore Each Variable
# For each lost/corrupted variable:

# Click "Add New"
# Enter variable name
# Enter value from backup
# Select environments (Production, Preview, Development)
# Click "Save"

# STEP 4: Verify All Variables Restored
vercel env ls --environment production

# Compare output with backup document
# Ensure all variables present

# STEP 5: Trigger Redeployment
# Vercel will auto-redeploy with new env vars
# Or manually trigger:
vercel --prod

# STEP 6: Monitor Deployment
# Watch deployment logs
# Verify successful

# STEP 7: Test Application
# Verify features using restored env vars work:
#   - Convex connection
#   - Clerk authentication
#   - Stripe payments
#   - Gemini AI
#   - Vapi voice AI

# STEP 8: Document Restoration
# Record in incident log:
#   - Variables restored
#   - Restoration timestamp
#   - Deployed by
```

---

### Procedure 3: Restore Third-Party Configuration

**Duration:** 30 minutes
**Downtime:** None (but features may be affected)

```bash
# STRIPE RESTORATION

# STEP 1: Access Backup Documentation
# Retrieve Stripe configuration backup

# STEP 2: Restore Webhook Endpoints
# Go to Stripe Dashboard → Developers → Webhooks
# Click "Add Endpoint"
# Enter endpoint URL from backup
# Select events from backup list
# Save webhook
# Copy new signing secret → Update STRIPE_WEBHOOK_SECRET in Vercel

# STEP 3: Verify Products/Prices
# Go to Stripe Dashboard → Products
# Verify all membership products exist:
#   - 18-month-minimum
#   - 12-month-minimum
#   - no-lock-in
#   - 12-month-upfront
# If missing, recreate from backup documentation

# CLERK RESTORATION

# STEP 4: Restore Clerk Webhooks
# Go to Clerk Dashboard → Webhooks
# Click "Add Endpoint"
# Enter endpoint URL from backup
# Select events from backup list
# Save webhook
# Copy signing secret → Update CLERK_WEBHOOK_SECRET in Vercel

# STEP 5: Verify Authentication Settings
# Go to Clerk Dashboard → Settings
# Verify:
#   - Redirect URLs correct
#   - OAuth providers enabled
#   - Domain settings correct

# VAPI RESTORATION

# STEP 6: Restore Vapi Workflow
# Go to Vapi Dashboard → Workflows
# Verify workflow ID matches: e13b1b19-3cd5-42ab-ba5d-7c46bf989a6e
# If workflow deleted, recreate:
#   - Import workflow from backup JSON (if available)
#   - Or manually reconfigure:
#     - Voice agent settings
#     - Function calling endpoints
#     - Variables (user_id, full_name)

# STEP 7: Test Integrations
# Test Stripe:
#   - Trigger test webhook event
#   - Verify received in Convex logs

# Test Clerk:
#   - Create test user
#   - Verify webhook received

# Test Vapi:
#   - Initiate test voice call
#   - Verify workflow executes

# STEP 8: Document Restoration
# Record in incident log:
#   - What was restored
#   - Configuration changes
#   - Testing results
```

---

## Testing & Verification

### Weekly Backup Verification Test

**Every Monday, 9:00 AM Melbourne**
**Duration:** 15 minutes
**Environment:** Staging

```bash
# STEP 1: Select Random Backup
# Choose one automated backup from past week

# STEP 2: Create Test Staging Environment
# Use Convex staging deployment

# STEP 3: Restore Backup to Staging
# Follow restoration procedure (Procedure 1 above)
# Use staging environment instead of production

# STEP 4: Verify Data Integrity
# Spot-check tables:
#   - Users: Random sample of 10 users
#   - Memberships: Check active subscriptions
#   - Orders: Recent orders present
#   - Bookings: Upcoming bookings exist

# STEP 5: Test Application Functionality
# Run smoke tests in staging
# Verify critical flows work with restored data

# STEP 6: Document Test Results
# Backup Verification Log:
#   - Date: [date]
#   - Backup tested: [backup ID]
#   - Backup timestamp: [timestamp]
#   - Restoration successful: Yes/No
#   - Data integrity verified: Yes/No
#   - Application functional: Yes/No
#   - Issues found: [list any issues]
#   - Tested by: [name]

# STEP 7: Clean Up
# Delete test staging data if needed
```

---

### Monthly Disaster Recovery Test

**First Monday of each month**
**Duration:** 1-2 hours
**Environment:** Staging

```bash
# STEP 1: Simulate Disaster Scenario
# Choose scenario:
#   A) Complete database loss
#   B) Corrupted data in critical table
#   C) Lost all environment variables
#   D) Lost third-party configurations

# STEP 2: Execute Full Recovery
# Follow all restoration procedures
# Time each step
# Document any blockers

# STEP 3: Verify Complete Recovery
# Test all features:
#   - Authentication
#   - Membership management
#   - Bookings
#   - Orders
#   - AI plan generation

# STEP 4: Measure Recovery Time
# Calculate:
#   - Time to detect issue
#   - Time to decision (which backup)
#   - Time to execute restore
#   - Time to verify
#   - Total recovery time

# STEP 5: Document Results
# Disaster Recovery Test Report:
#   - Date: [date]
#   - Scenario tested: [description]
#   - Recovery time: [minutes]
#   - Data loss: [timespan]
#   - Issues encountered: [list]
#   - Recommendations: [improvements]

# STEP 6: Update Procedures
# If issues found, update:
#   - This document (BACKUP_STRATEGY.md)
#   - ROLLBACK_PLAN.md
#   - INCIDENT_RESPONSE_PLAN.md
```

---

## Retention Policies

### Convex Database Backups

| Backup Type | Retention Period | Storage Location |
|-------------|------------------|------------------|
| Automated Daily | 30 days | Convex infrastructure |
| Manual (Pre-deployment) | 90 days | Convex infrastructure |
| Manual (Pre-migration) | 90 days | Convex infrastructure |
| Critical (Pre-major release) | 1 year | Convex infrastructure |

### Code Repository

| Type | Retention Period | Storage Location |
|------|------------------|------------------|
| Git commits | Infinite | GitHub |
| Release tags | Infinite | GitHub |
| Feature branches | 90 days after merge | GitHub |

### Environment Variables

| Type | Retention Period | Storage Location |
|------|------------------|------------------|
| Current variables | Infinite | Password manager |
| Historical snapshots | 1 year | Secure cloud storage |

### Configuration Documentation

| Type | Retention Period | Storage Location |
|------|------------------|------------------|
| Current configuration | Infinite | Password manager |
| Historical configuration | 1 year | Secure cloud storage |

---

## Storage Locations

### Primary Storage

**Convex Database Backups:**
- Location: Convex managed infrastructure
- Encryption: At rest (AES-256)
- Redundancy: Cross-region replication
- Access: Convex Dashboard, API

**Code Repository:**
- Location: GitHub
- Encryption: In transit (TLS)
- Redundancy: GitHub's infrastructure
- Access: Git CLI, GitHub Web

**Environment Variables:**
- Location: 1Password / AWS Secrets Manager
- Encryption: At rest + in transit
- Redundancy: Provider-managed
- Access: Web UI, CLI

### Secondary Storage (Redundant)

**Critical Backups:**
- Location: Google Drive / Dropbox
- Folder: `/Derrimut/Backups/`
- Structure:
  ```
  /Derrimut/Backups/
    /Database/
      - backup-log.xlsx
      - critical-backups-index.md
    /Environment Variables/
      - env-prod-20250109.txt
      - env-staging-20250109.txt
    /Configuration/
      - stripe-config-20250109.md
      - clerk-config-20250109.md
      - vapi-config-20250109.md
  ```
- Access: Eng Lead, CTO only
- Encryption: Google Drive encryption + password-protected files

---

## Access Control

### Backup Access Permissions

| Role | Convex Backups | Code Repository | Env Variables | Config Docs |
|------|----------------|-----------------|---------------|-------------|
| Developer | Read | Read/Write | No Access | Read |
| Eng Lead | Read/Write | Read/Write | Read/Write | Read/Write |
| CTO | Read/Write | Read/Write | Read/Write | Read/Write |
| DevOps | Read/Write | Read | Read/Write | Read/Write |

### Restoration Approval Required

| Operation | Approval Required | Approver |
|-----------|-------------------|----------|
| Restore staging database | No | Any developer |
| Restore production database | Yes | CTO |
| Restore env variables | Yes | Eng Lead |
| Restore third-party config | Yes | Eng Lead |

---

## Backup Monitoring

### Automated Alerts

**Setup alerts for:**
- ✅ Automated backup failure (Convex)
- ✅ Backup storage approaching limit
- ✅ Backup restoration failure
- ✅ Backup verification test failure

**Alert Channels:**
- Slack: #engineering
- Email: engineering@derrimut247.com.au
- PagerDuty (for P0 backup failures)

### Metrics to Monitor

- Backup success rate (target: 100%)
- Backup duration (trend over time)
- Backup size (growth rate)
- Restoration success rate (from tests)
- Recovery time objective (RTO): < 30 minutes
- Recovery point objective (RPO): < 24 hours

---

## Backup Checklist (Quick Reference)

### Before Production Deployment
- [ ] Create manual Convex database backup
- [ ] Document backup ID and timestamp
- [ ] Verify backup completed successfully

### After Environment Variable Change
- [ ] Export env vars: `vercel env ls`
- [ ] Update password manager entry
- [ ] Store backup in secure cloud storage

### After Third-Party Configuration Change
- [ ] Document new configuration
- [ ] Update configuration backup document
- [ ] Test configuration change

### Weekly (Every Monday)
- [ ] Verify last automated backup successful
- [ ] Test one backup restoration (staging)
- [ ] Review backup storage usage

### Monthly (First Monday)
- [ ] Full disaster recovery test
- [ ] Review retention policies
- [ ] Audit access permissions
- [ ] Update documentation if needed

---

## Related Documentation

- [Rollback Plan](./ROLLBACK_PLAN.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Incident Response Plan](./INCIDENT_RESPONSE_PLAN.md)
- [Runbooks](./docs/RUNBOOKS.md)

---

**Document Version:** 1.0.0
**Last Updated:** January 9, 2025
**Next Review:** February 9, 2025
