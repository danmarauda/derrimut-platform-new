# 🚀 Sentry Setup via Vercel Marketplace

**The easiest way to set up Sentry for your Derrimut Platform!**

---

## ✨ Why Vercel Marketplace?

- **Automatic configuration** - No manual DSN setup needed
- **Automatic environment variables** - Injected into all environments
- **Automatic source maps** - Upload configured automatically
- **One-click setup** - Takes less than 2 minutes
- **Free tier included** - 5,000 errors/month

---

## 📋 Step-by-Step Setup (2 minutes)

### **Step 1: Access Vercel Dashboard**

1. Go to: https://vercel.com/dashboard
2. Select your project: **DerrimutPlatform**
3. Click on **"Integrations"** tab

### **Step 2: Install Sentry Integration**

1. Search for **"Sentry"** in the integrations marketplace
2. Or go directly to: https://vercel.com/integrations/sentry
3. Click **"Add Integration"**
4. Click **"Continue"** to authorize

### **Step 3: Configure Sentry**

You'll see a configuration screen with options:

#### **Option 1: Create New Sentry Project (Recommended)**
- Select: **"Create new Sentry project"**
- Project name: `derrimut-platform`
- Platform: **Next.js**
- Click **"Create Project"**

#### **Option 2: Use Existing Sentry Project**
- Select your existing Sentry organization
- Select your existing project
- Click **"Connect"**

### **Step 4: Select Vercel Projects**

- Check the box next to: **DerrimutPlatform**
- Click **"Add Integration"**

### **Step 5: Verify Installation** ✅

The integration will automatically:
- ✅ Create Sentry project (if new)
- ✅ Add environment variables to Vercel
- ✅ Configure source maps upload
- ✅ Set up error tracking

---

## 🔑 Environment Variables (Auto-Configured)

The integration automatically adds these to **all environments** (Development, Preview, Production):

```bash
# Auto-configured by Vercel Marketplace
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[region].ingest.sentry.io/[project-id]
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=derrimut-platform
SENTRY_AUTH_TOKEN=[auto-generated-token]
```

**You don't need to add these manually!** 🎉

---

## ✅ Verification Steps

### **1. Check Environment Variables in Vercel**

1. Go to your Vercel project settings
2. Navigate to: **Settings → Environment Variables**
3. Verify you see:
   - `NEXT_PUBLIC_SENTRY_DSN` (Production, Preview, Development)
   - `SENTRY_ORG` (Production, Preview, Development)
   - `SENTRY_PROJECT` (Production, Preview, Development)
   - `SENTRY_AUTH_TOKEN` (Production, Preview, Development)

### **2. Pull Environment Variables Locally**

```bash
# Pull Vercel environment variables to .env.local
vercel env pull .env.local

# Verify Sentry variables are set
node scripts/verify-sentry.js
```

### **3. Test Error Tracking Locally**

```bash
# Start dev server
npm run dev

# Test error tracking (in another terminal)
curl http://localhost:3000/api/test-sentry?type=error

# You should see in terminal:
# ✅ Error sent to Sentry: Test error from Sentry test endpoint
```

### **4. Check Sentry Dashboard**

1. Go to: https://sentry.io
2. Navigate to your **derrimut-platform** project
3. Go to **Issues** → You should see the test error!
4. Error details should include:
   - Full stack trace
   - Request details
   - Environment info
   - Source maps (readable code)

---

## 🎯 Testing Error Tracking

### **Test Endpoints Available**

We've created test endpoints for you:

```bash
# Test different error types
curl http://localhost:3000/api/test-sentry?type=error     # Regular error
curl http://localhost:3000/api/test-sentry?type=warning   # Warning level
curl http://localhost:3000/api/test-sentry?type=info      # Info message
```

### **Test in Browser**

1. Open your app: http://localhost:3000
2. Open browser console
3. Type: `throw new Error("Test error from browser")`
4. Check Sentry dashboard → New error should appear!

### **Test Error Boundary**

1. Visit a page that uses ErrorBoundary
2. Trigger an error (e.g., access undefined property)
3. You should see the error fallback UI
4. Error is automatically logged to Sentry

---

## 📊 What's Being Tracked?

With the Vercel integration, Sentry automatically tracks:

### **Backend Errors**
- ✅ API route errors (`/api/*`)
- ✅ Server-side rendering errors
- ✅ Middleware errors
- ✅ Convex HTTP endpoint errors

### **Frontend Errors**
- ✅ React component errors
- ✅ ErrorBoundary catches
- ✅ Unhandled promise rejections
- ✅ Window errors

### **Performance Monitoring** (if enabled)
- ✅ Page load performance
- ✅ API response times
- ✅ Database query times
- ✅ Third-party service latency

### **Context Included**
- ✅ User information (Clerk user ID)
- ✅ Request details (URL, method, headers)
- ✅ Browser info (user agent, viewport)
- ✅ Environment (development, preview, production)
- ✅ Custom breadcrumbs
- ✅ Source maps (readable stack traces)

---

## 🔧 Advanced Configuration (Optional)

### **Enable Performance Monitoring**

1. Go to Sentry dashboard
2. Project Settings → Performance
3. Enable Performance Monitoring
4. Set sample rate (e.g., 10% = 0.1)

Update `sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // Sample 10% of transactions
  // ... rest of config
});
```

### **Configure Error Sampling**

To reduce quota usage, sample errors:

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sampleRate: 0.5, // Sample 50% of errors
  // ... rest of config
});
```

### **Filter Sensitive Data**

Already configured in `sentry.server.config.ts`:
```typescript
beforeSend(event) {
  // Remove sensitive data
  if (event.request?.cookies) {
    delete event.request.cookies;
  }
  return event;
}
```

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] Sentry integration installed via Vercel Marketplace
- [ ] Environment variables auto-configured in all environments
- [ ] Tested error tracking in development (`/api/test-sentry`)
- [ ] Verified errors appear in Sentry dashboard
- [ ] Source maps uploading correctly (readable stack traces)
- [ ] ErrorBoundary catching and logging errors
- [ ] Team members added to Sentry project
- [ ] Alert rules configured (email/Slack notifications)
- [ ] Error sampling configured (if high traffic expected)
- [ ] Performance monitoring enabled (optional)

---

## 🚨 Troubleshooting

### **Problem: No errors showing in Sentry**

**Solutions:**
1. Check environment variables are set:
   ```bash
   vercel env pull .env.local
   node scripts/verify-sentry.js
   ```

2. Verify `NEXT_PUBLIC_SENTRY_DSN` starts with `https://`

3. Check Sentry project is active (not paused)

4. Test with `/api/test-sentry?type=error`

### **Problem: Stack traces are minified/unreadable**

**Solutions:**
1. Verify `SENTRY_AUTH_TOKEN` is set in Vercel environment variables

2. Check source maps are uploading:
   ```bash
   npm run build
   # Look for: "Uploading source maps to Sentry..."
   ```

3. Verify `sentry.properties` file exists (auto-created by integration)

### **Problem: Too many errors, quota exceeded**

**Solutions:**
1. Configure error sampling (see Advanced Configuration above)

2. Use `ignoreErrors` in Sentry config:
   ```typescript
   ignoreErrors: [
     'ResizeObserver loop limit exceeded',
     'Non-Error promise rejection captured',
   ],
   ```

3. Upgrade Sentry plan or adjust quotas

### **Problem: Environment variables not available locally**

**Solution:**
```bash
# Pull from Vercel
vercel env pull .env.local

# Verify
cat .env.local | grep SENTRY
```

---

## 📚 Additional Resources

### **Sentry Documentation**
- Official docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Vercel integration: https://vercel.com/integrations/sentry

### **Derrimut Platform Sentry Docs**
- Setup guide (this file): `VERCEL_SENTRY_SETUP.md`
- Detailed Sentry docs: `docs/SENTRY_SETUP.md`
- Environment variables: `ENVIRONMENT_KEYS_GUIDE.md`

### **Sentry Dashboard**
- Login: https://sentry.io
- Your project: https://sentry.io/organizations/YOUR_ORG/projects/derrimut-platform/

---

## 🎉 Success Criteria

You'll know Sentry is working when:

✅ Environment variables auto-configured in Vercel
✅ Test error appears in Sentry dashboard
✅ Stack traces are readable (source maps working)
✅ ErrorBoundary errors are logged
✅ Production errors are captured and alerting

---

## 🚀 Next Steps After Setup

1. **Configure Alerts**
   - Go to Sentry → Project Settings → Alerts
   - Add email/Slack notifications for new issues
   - Set up workflow notifications (assigned, resolved, etc.)

2. **Add Team Members**
   - Go to Sentry → Settings → Members
   - Invite team members to the project
   - Assign roles (Admin, Member, Viewer)

3. **Set Up Issue Ownership**
   - Create `CODEOWNERS` file in repo
   - Sentry will auto-assign issues based on file ownership

4. **Monitor Production**
   - Check Sentry dashboard daily
   - Triage new issues
   - Fix critical errors
   - Monitor error rates and trends

---

**Setup Time:** ~2 minutes
**Difficulty:** Easy ⭐
**Cost:** Free (5,000 errors/month)
**Status:** Production-ready ✅

**Need help?** Check `docs/SENTRY_SETUP.md` for detailed troubleshooting.
