# Vercel Marketplace Integrations & CLI Guide

**Generated:** 2025-01-09
**Project:** Derrimut 24:7 Gym Platform
**Vercel Account:** derrimut.aliaslabs.ai

---

## 📋 Overview

The Vercel Marketplace offers native integrations that connect directly to your Vercel projects with unified billing, single sign-on, and automated setup. This guide covers all available CLI commands and integration categories for 2025.

---

## 🚀 Vercel CLI Integration Commands

### Installation & Setup

#### Install Vercel CLI
```bash
# Using npm
npm i -g vercel

# Using Homebrew (macOS)
brew install vercel-cli

# Verify installation
vercel --version
```

#### Authenticate
```bash
vercel login
```

---

### Core Integration Commands

#### 1. `vercel install` - Install Marketplace Integrations

**Syntax:**
```bash
vercel install <integration-slug>
# Or shorthand:
vc i <integration-slug>
```

**Examples:**
```bash
# Install Supabase
vercel install supabase

# Install Sentry
vercel install sentry

# Install Redis
vercel install upstash-redis

# Install EdgeDB
vercel install edgedb
```

**Behavior:**
- **First-time installation:** Opens Vercel dashboard to accept Marketplace terms, then prompts to add product via dashboard or CLI
- **Existing installation:** Allows adding products directly from CLI through interactive prompts

**Finding Integration Slug:**
The slug is in the marketplace URL:
- URL: `https://vercel.com/marketplace/sentry`
- Slug: `sentry`

---

#### 2. `vercel integration add` - Add Integration Resources

**Syntax:**
```bash
vercel integration add <integration-name>
```

**Purpose:**
- Initializes setup wizard for creating integration resource
- Equivalent to `vercel install` for adding resources
- Opens browser to Vercel dashboard if integration isn't installed

**Example:**
```bash
vercel integration add supabase
```

---

#### 3. `vercel integration list` - View Installed Integrations

**Syntax:**
```bash
vercel integration list
```

**Output:**
Displays all installed resources with:
- Name
- Status
- Product
- Associated integration

**Example Output:**
```
Name                Status    Product           Integration
my-postgres-db      active    PostgreSQL        Supabase
my-redis-store      active    Redis             Upstash
error-monitoring    active    Error Tracking    Sentry
```

---

#### 4. `vercel integration open` - Open Provider Dashboard

**Syntax:**
```bash
vercel integration open <integration-name>
```

**Purpose:**
Opens deep link into provider's dashboard for specific integration

**Example:**
```bash
# Open Sentry dashboard
vercel integration open sentry

# Open Supabase dashboard
vercel integration open supabase
```

---

#### 5. `vercel integration remove` - Uninstall Integration

**Syntax:**
```bash
vercel integration remove <integration-name>
```

**Requirements:**
- Must remove all installed resources first
- Useful for automation workflows

**Example:**
```bash
vercel integration remove sentry
```

---

### Global Options (Available on All Commands)

```bash
--cwd <path>           # Set current working directory
--debug                # Enable debug mode
--global-config <path> # Set global configuration path
--help                 # Display help information
--local-config <path>  # Set local configuration path
--no-color             # Disable colored output
--scope <team>         # Specify team scope
--token <token>        # Provide authentication token
```

**Example with Options:**
```bash
vercel install sentry --scope my-team --debug
```

---

## 🏪 Vercel Marketplace Integration Categories

### 1. 📊 Analytics Integrations

**Purpose:** Track user behavior, performance, and business metrics

**Available Integrations:**

- **Vercel Web Analytics**
  - Privacy-friendly, first-party analytics
  - Slug: `vercel-analytics`
  - CLI: `vercel install vercel-analytics`

- **Statsig**
  - Build, Measure, Ship with 2M events free tier
  - Full experimentation, analytics, and feature management
  - Slug: `statsig`
  - CLI: `vercel install statsig`

- **Tinybird**
  - Purpose-built analytics backend for serverless real-time analytics
  - Slug: `tinybird`
  - CLI: `vercel install tinybird`

- **Hypertune**
  - Type-safe feature flags and A/B testing
  - Slug: `hypertune`
  - CLI: `vercel install hypertune`

- **LaunchDarkly**
  - Access feature flags in Vercel Edge Config
  - Slug: `launchdarkly`
  - CLI: `vercel install launchdarkly`

---

### 2. 🔍 Monitoring & Observability

**Purpose:** Error tracking, performance monitoring, uptime checks

**Available Integrations:**

- **Sentry** (NEW 2025)
  - Unified error and performance monitoring
  - Distributed tracing across services
  - Single sign-on, unified billing
  - Slug: `sentry`
  - CLI: `vercel install sentry`

- **Checkly** (NEW 2025)
  - Test & monitor with Playwright
  - Reliability testing for modern engineering
  - Slug: `checkly`
  - CLI: `vercel install checkly`

- **Dash0** (NEW 2025)
  - Observability platform
  - Trace drains support
  - Slug: `dash0`
  - CLI: `vercel install dash0`

- **DebugBear**
  - Monitor site speed and Lighthouse scores
  - Slug: `debugbear`
  - CLI: `vercel install debugbear`

- **Zeitgeist**
  - Additional monitoring capabilities
  - Slug: `zeitgeist`
  - CLI: `vercel install zeitgeist`

---

### 3. 🗄️ Database Integrations

**Purpose:** Managed databases with automatic environment variable sync

**Available Native Integrations:**

- **Supabase**
  - PostgreSQL database
  - Authentication, storage, edge functions
  - Automatic provisioning
  - Slug: `supabase`
  - CLI: `vercel install supabase`

- **EdgeDB**
  - Next-generation graph-relational database
  - Type-safe queries
  - Slug: `edgedb`
  - CLI: `vercel install edgedb`

- **PlanetScale**
  - MySQL-compatible serverless database
  - Automatic scaling
  - Slug: `planetscale`
  - CLI: `vercel install planetscale`

**Note:** Databases automatically sync environment variables to connected projects

---

### 4. ⚡ Redis & Caching

**Purpose:** In-memory data stores for caching and real-time features

**Available Integrations:**

- **Upstash Redis**
  - Serverless Redis
  - Per-request pricing
  - Slug: `upstash-redis`
  - CLI: `vercel install upstash-redis`

---

### 5. 🤖 AI Agents & Services (NEW 2025)

**Purpose:** Add AI-powered workflows with unified billing and observability

**Features:**
- Native Vercel integrations
- Unified billing
- Built-in observability
- Streamlined installation

**Available Integrations:**
- **Braintrust** - AI observability and evaluation
  - Slug: `braintrust`
  - CLI: `vercel install braintrust`

**Note:** This is a new category with more integrations being added

---

### 6. 🔧 Developer Tools

**Purpose:** Development workflow enhancements

**Examples:**
- Feature flag management
- A/B testing platforms
- Experimentation tools

---

### 7. 📨 Trace Drains (NEW 2025)

**Purpose:** Stream traces and logs to observability providers

**Supported Providers:**
- Braintrust
- Dash0

**Usage:**
Send traces and logs from Vercel projects to preferred observability providers for debugging, performance monitoring, and evaluation data analysis.

---

## 🛠️ Common CLI Workflows for Derrimut Platform

### Setup Monitoring Stack

```bash
# Install Sentry for error tracking
vercel install sentry

# Install Checkly for uptime monitoring
vercel install checkly

# List all installed integrations
vercel integration list

# Open Sentry dashboard
vercel integration open sentry
```

---

### Setup Database

```bash
# Install Supabase
vercel install supabase

# Follow CLI prompts to create database
# Environment variables automatically added to project

# Verify in project
cat .env.local
# Should show:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

### Setup Analytics

```bash
# Install Vercel Analytics
vercel install vercel-analytics

# Install Statsig for experimentation
vercel install statsig

# View all analytics integrations
vercel integration list
```

---

### Setup Redis Cache

```bash
# Install Upstash Redis
vercel install upstash-redis

# Follow prompts to create Redis instance
# Environment variables automatically synced
```

---

## 🎯 Recommended Integrations for Derrimut Platform

Based on your current stack and needs:

### Essential Integrations

1. **Sentry** - Error Tracking & Performance
   ```bash
   vercel install sentry
   ```
   **Why:** Already partially configured in your project, native integration provides better DX

2. **Vercel Web Analytics** - Privacy-Friendly Analytics
   ```bash
   vercel install vercel-analytics
   ```
   **Why:** First-party analytics, GDPR compliant, no cookie banners needed

3. **Checkly** - Uptime Monitoring
   ```bash
   vercel install checkly
   ```
   **Why:** Ensure 24/7 availability for your 24/7 gym platform

### Enhanced Integrations

4. **Supabase** - Database (if migrating from Convex)
   ```bash
   vercel install supabase
   ```
   **Why:** Native integration, automatic env var sync, PostgreSQL compatibility

5. **Upstash Redis** - Caching Layer
   ```bash
   vercel install upstash-redis
   ```
   **Why:** Improve performance for frequently accessed data (membership plans, trainer availability)

6. **Statsig** - A/B Testing & Feature Flags
   ```bash
   vercel install statsig
   ```
   **Why:** Test membership pricing, trainer booking flows, marketplace features

---

## 📦 Integration Resource Management

### View All Resources

```bash
vercel integration list
```

### Add Resource to Existing Integration

```bash
vercel integration add <integration-name>
```

### Open Provider Dashboard

```bash
vercel integration open <integration-name>
```

### Remove Integration

```bash
# First, remove all resources via dashboard
# Then uninstall integration:
vercel integration remove <integration-name>
```

---

## 🔐 Environment Variable Synchronization

**Automatic Sync:** Native integrations automatically add environment variables to your Vercel projects.

**Example After Installing Supabase:**
```env
# .env.local (automatically added)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Viewing in Dashboard:**
```
Project Settings > Environment Variables
```

**Pulling to Local:**
```bash
vercel env pull .env.local
```

---

## 🚀 Deployment Integration Actions (NEW 2025)

Marketplace integration providers can register integration actions for deployments:

**Supported Actions:**
- Database branching
- Environment variable overrides
- Readiness checks
- Automated resource-side tasks

**How It Works:**
1. Deploy triggers integration action
2. Provider executes registered task (e.g., create database branch)
3. Deployment continues with provisioned resources

---

## 🔍 Finding Integration Slugs

**Method 1: Marketplace URL**
```
URL: https://vercel.com/marketplace/sentry
Slug: sentry
```

**Method 2: List Command**
```bash
vercel integration list
```

**Method 3: Marketplace Browse**
Visit [vercel.com/marketplace](https://vercel.com/marketplace) and browse categories

---

## 🐛 Troubleshooting

### Integration Not Installing

**Problem:** `vercel install` fails or hangs

**Solutions:**
- Verify authenticated: `vercel whoami`
- Check internet connection
- Try with `--debug` flag: `vercel install <slug> --debug`
- Ensure integration slug is correct

### Environment Variables Not Syncing

**Problem:** Env vars not appearing in project

**Solutions:**
- Pull latest env vars: `vercel env pull`
- Verify integration is connected to project in dashboard
- Check project scope: `vercel integration list --scope <team>`
- Restart development server

### Integration Commands Not Found

**Problem:** `vercel integration` command not recognized

**Solutions:**
- Update Vercel CLI: `npm i -g vercel@latest`
- Verify CLI version: `vercel --version` (need v28.0.0+)
- Reinstall CLI if needed

### Cannot Remove Integration

**Problem:** `vercel integration remove` fails

**Solutions:**
- Remove all resources first via dashboard
- Check for dependent projects
- Use `--force` flag (if available)
- Contact Vercel support

---

## 📚 Additional Resources

### Official Documentation

- **Vercel CLI Reference:** https://vercel.com/docs/cli
- **Integration Commands:** https://vercel.com/docs/cli/integration
- **Install Command:** https://vercel.com/docs/cli/install
- **Marketplace:** https://vercel.com/marketplace
- **Integrations Overview:** https://vercel.com/docs/integrations

### Integration-Specific Docs

- **Sentry:** https://vercel.com/marketplace/sentry
- **Supabase:** https://supabase.com/docs/guides/integrations/vercel-marketplace
- **Statsig:** https://www.statsig.com/blog/statsig-vercel-native-integration

---

## 🎯 Quick Reference

### Most Common Commands

```bash
# Install integration
vercel install <slug>

# List integrations
vercel integration list

# Add resource
vercel integration add <name>

# Open dashboard
vercel integration open <name>

# Remove integration
vercel integration remove <name>

# Pull env vars
vercel env pull
```

### Integration Slug Quick Reference

| Integration | Slug | Category |
|------------|------|----------|
| Sentry | `sentry` | Monitoring |
| Supabase | `supabase` | Database |
| Redis | `upstash-redis` | Caching |
| Analytics | `vercel-analytics` | Analytics |
| Checkly | `checkly` | Monitoring |
| Statsig | `statsig` | Analytics |
| EdgeDB | `edgedb` | Database |
| Tinybird | `tinybird` | Analytics |

---

*Last Updated: January 9, 2025*
*CLI Version: v28.0.0+*
