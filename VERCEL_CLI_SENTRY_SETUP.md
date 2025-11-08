# 🚀 Sentry Setup via Vercel CLI

**Set up Sentry integration using Vercel CLI in under 3 minutes!**

---

## 📋 Prerequisites

Make sure you have Vercel CLI installed and are logged in.

---

## ⚡ Quick Setup (3 Steps)

### **Step 1: Link Your Project**

```bash
# Make sure you're in the project directory
cd /Users/alias/Downloads/alias-x-maker-coffee-ai-presentation\ \(1\)/alias-awe/DerrimutPlatform

# Link to Vercel (if not already linked)
vercel link

# Follow prompts:
# - Set up and deploy? No (we're just linking)
# - Which scope? Select your account/team
# - Link to existing project? Yes
# - What's the name? DerrimutPlatform (or your project name)
```

### **Step 2: Add Sentry Integration**

```bash
# List available integrations
vercel integrations list

# Add Sentry integration
vercel integrations add sentry

# Follow the interactive prompts:
# 1. Choose: "Create new Sentry project" or "Use existing"
# 2. If new:
#    - Organization: Select your organization
#    - Project name: derrimut-platform
#    - Platform: Next.js
# 3. Confirm installation
```

### **Step 3: Pull Environment Variables**

```bash
# Pull the auto-configured Sentry environment variables
vercel env pull .env.local

# Verify Sentry is configured
node scripts/verify-sentry.js
```

**Done!** ✅ Sentry is now configured.

---

## 🎯 Alternative: Manual Environment Variable Setup

If you prefer to configure manually or already have a Sentry account:

### **Step 1: Get Your Sentry DSN**

```bash
# Option 1: Create via Sentry CLI (if you have it)
sentry-cli projects create derrimut-platform --platform next.js

# Option 2: Create via web (https://sentry.io)
# - Create new project
# - Platform: Next.js
# - Copy the DSN
```

### **Step 2: Add Environment Variables via CLI**

```bash
# Add Sentry DSN (all environments)
vercel env add NEXT_PUBLIC_SENTRY_DSN production preview development

# When prompted, paste your DSN:
# https://[key]@[region].ingest.sentry.io/[project-id]

# Add Sentry organization (optional, for source maps)
vercel env add SENTRY_ORG production preview development
# When prompted, enter your Sentry organization slug

# Add Sentry project (optional, for source maps)
vercel env add SENTRY_PROJECT production preview development
# When prompted, enter: derrimut-platform

# Add auth token (optional, for source maps upload)
# Get from: https://sentry.io/settings/account/api/auth-tokens/
vercel env add SENTRY_AUTH_TOKEN production preview development
# When prompted, paste your auth token
```

### **Step 3: Pull to Local Environment**

```bash
# Pull all environment variables to .env.local
vercel env pull .env.local

# Verify
node scripts/verify-sentry.js
```

---

## ✅ Verification Steps

### **1. Check Vercel Environment Variables**

```bash
# List all environment variables
vercel env ls

# You should see:
# NEXT_PUBLIC_SENTRY_DSN (production, preview, development)
# SENTRY_ORG (production, preview, development)
# SENTRY_PROJECT (production, preview, development)
# SENTRY_AUTH_TOKEN (production, preview, development)
```

### **2. Verify Local Configuration**

```bash
# Check .env.local file
cat .env.local | grep SENTRY

# Expected output:
# NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
# SENTRY_ORG="your-org"
# SENTRY_PROJECT="derrimut-platform"
# SENTRY_AUTH_TOKEN="xxx"
```

### **3. Run Verification Script**

```bash
node scripts/verify-sentry.js
```

**Expected output:**
```
🔍 Verifying Sentry Configuration via Vercel Marketplace...

📋 Required Environment Variables:
  ✅ NEXT_PUBLIC_SENTRY_DSN: https://xxx...
  ✅ SENTRY_ORG: your-org...
  ✅ SENTRY_PROJECT: derrimut-platform...

📋 Optional Environment Variables:
  ✅ SENTRY_AUTH_TOKEN: xxx...

📊 Summary:
  ✅ All required Sentry variables are configured!
  ✅ Sentry error tracking is READY

🎯 Next Steps:
  1. Test error tracking: npm run dev
  2. Visit: http://localhost:3000/api/test-sentry?type=error
  3. Check Sentry dashboard: https://sentry.io
```

---

## 🧪 Testing Sentry Integration

### **Test 1: Local Development**

```bash
# Start dev server
npm run dev

# In another terminal, test error tracking
curl http://localhost:3000/api/test-sentry?type=error

# Expected response:
# {"message":"Error sent to Sentry","error":"Test error from Sentry test endpoint"}
```

### **Test 2: Check Sentry Dashboard**

```bash
# Open Sentry dashboard
open https://sentry.io

# Navigate to:
# Projects → derrimut-platform → Issues

# You should see:
# "Test error from Sentry test endpoint"
# - Click to view full details
# - Stack trace should be readable (source maps working)
```

### **Test 3: Test Different Error Types**

```bash
# Test regular error
curl http://localhost:3000/api/test-sentry?type=error

# Test warning
curl http://localhost:3000/api/test-sentry?type=warning

# Test info message
curl http://localhost:3000/api/test-sentry?type=info

# Check Sentry dashboard - all should appear with correct severity
```

---

## 🔧 Common CLI Commands

### **Environment Variables**

```bash
# List all environment variables
vercel env ls

# Add new environment variable
vercel env add VARIABLE_NAME production preview development

# Remove environment variable
vercel env rm VARIABLE_NAME production

# Pull environment variables to local
vercel env pull .env.local

# Pull for specific environment
vercel env pull .env.production production
```

### **Integrations**

```bash
# List available integrations
vercel integrations list

# List installed integrations
vercel integrations ls

# Add integration
vercel integrations add sentry

# Remove integration
vercel integrations remove sentry
```

### **Project Information**

```bash
# Show project info
vercel project ls

# Show current project
vercel project

# Link project
vercel link
```

---

## 🚨 Troubleshooting

### **Problem: `vercel` command not found**

**Solution:**
```bash
# Install Vercel CLI globally
npm install -g vercel

# Or use npx (no installation needed)
npx vercel link
npx vercel integrations add sentry
```

### **Problem: Not logged into Vercel**

**Solution:**
```bash
# Login to Vercel
vercel login

# Or use specific method
vercel login --github  # Login with GitHub
vercel login --gitlab  # Login with GitLab
```

### **Problem: Project not linked**

**Solution:**
```bash
# Link your project
vercel link

# If multiple teams, specify team
vercel link --scope=team-name
```

### **Problem: Environment variables not pulling**

**Solution:**
```bash
# Make sure you're in the project directory
pwd

# Try pulling with specific environment
vercel env pull .env.local

# Or pull specific environment
vercel env pull .env.production production

# Check if variables exist
vercel env ls
```

### **Problem: Sentry integration not found**

**Solution:**
```bash
# Update Vercel CLI
npm update -g vercel

# Or use latest with npx
npx vercel@latest integrations add sentry

# If still not available, use manual setup (see above)
```

### **Problem: Source maps not uploading**

**Solution:**
```bash
# Make sure SENTRY_AUTH_TOKEN is set
vercel env ls | grep SENTRY_AUTH_TOKEN

# If not set, create auth token:
# 1. Go to: https://sentry.io/settings/account/api/auth-tokens/
# 2. Create new token with scopes:
#    - project:read
#    - project:releases
#    - org:read
# 3. Add to Vercel:
vercel env add SENTRY_AUTH_TOKEN production preview development

# Test build
npm run build
# Look for: "Uploading source maps to Sentry..."
```

---

## 📊 Environment Variable Reference

| Variable | Required | Purpose | Where to Get |
|----------|----------|---------|--------------|
| `NEXT_PUBLIC_SENTRY_DSN` | ✅ Yes | Error tracking endpoint | Sentry project settings → Client Keys |
| `SENTRY_ORG` | ⚠️ Optional | Your Sentry organization | Sentry settings → Organization slug |
| `SENTRY_PROJECT` | ⚠️ Optional | Your Sentry project | Sentry project settings → Project slug |
| `SENTRY_AUTH_TOKEN` | ⚠️ Optional | Upload source maps | Sentry settings → Auth tokens |

**Note:** Optional variables are only needed for source map uploads (makes errors more readable).

---

## 🎯 Post-Setup Checklist

After setup is complete:

- [ ] Vercel CLI installed and logged in
- [ ] Project linked to Vercel
- [ ] Sentry integration added (via CLI or manually)
- [ ] Environment variables configured (all environments)
- [ ] Environment variables pulled locally (`.env.local`)
- [ ] Verification script passes (`node scripts/verify-sentry.js`)
- [ ] Test error sent successfully (`/api/test-sentry`)
- [ ] Error appears in Sentry dashboard
- [ ] Source maps uploading (readable stack traces)
- [ ] Team members added to Sentry project
- [ ] Alert rules configured (optional)

---

## 🚀 Deploy and Test

### **Deploy to Preview**

```bash
# Deploy to preview environment
vercel

# Test error tracking on preview
curl https://your-preview-url.vercel.app/api/test-sentry?type=error

# Check Sentry dashboard for preview environment errors
```

### **Deploy to Production**

```bash
# Deploy to production
vercel --prod

# Test error tracking on production
curl https://your-domain.com/api/test-sentry?type=error

# Monitor Sentry dashboard for production errors
```

---

## 📚 Additional Resources

### **Vercel CLI Documentation**
- Official docs: https://vercel.com/docs/cli
- Environment variables: https://vercel.com/docs/cli/env
- Integrations: https://vercel.com/docs/cli/integrations

### **Sentry Documentation**
- Next.js setup: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Source maps: https://docs.sentry.io/platforms/javascript/sourcemaps/

### **Related Files**
- Setup guide (this file): `VERCEL_CLI_SENTRY_SETUP.md`
- Marketplace guide: `VERCEL_SENTRY_SETUP.md`
- Detailed Sentry docs: `docs/SENTRY_SETUP.md`
- Environment variables: `ENVIRONMENT_KEYS_GUIDE.md`

---

## 💡 Pro Tips

### **Quick Login**

```bash
# Save your token for faster login
vercel login --token YOUR_TOKEN

# Or set environment variable
export VERCEL_TOKEN=your_token
```

### **Team Management**

```bash
# Switch between teams
vercel switch

# List teams
vercel teams ls

# Set default team
vercel teams set team-name
```

### **Automated Workflows**

```bash
# Add to CI/CD pipeline
vercel env pull .env.ci

# Deploy from CI
vercel deploy --token=$VERCEL_TOKEN
```

### **Environment-Specific Variables**

```bash
# Different values per environment
vercel env add DATABASE_URL production    # Prod DB
vercel env add DATABASE_URL preview       # Staging DB
vercel env add DATABASE_URL development   # Local DB
```

---

**Setup Time:** 3 minutes with CLI
**Difficulty:** Easy ⭐
**Prerequisites:** Vercel CLI, Vercel account
**Status:** Production-ready ✅

**Need help?** Run `vercel --help` or check https://vercel.com/docs/cli
