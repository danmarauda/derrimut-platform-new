# Sentry Error Tracking Setup Guide

## Overview

Sentry is configured for comprehensive error tracking and performance monitoring across the Derrimut Platform.

**Status:** ✅ Configured
**Last Updated:** January 9, 2025

---

## Configuration Files

### Core Configuration
- `sentry.client.config.ts` - Client-side (browser) configuration
- `sentry.server.config.ts` - Server-side (Node.js) configuration
- `sentry.edge.config.ts` - Edge runtime (middleware) configuration
- `instrumentation.ts` - Next.js instrumentation hook

### Integration
- `next.config.ts` - Sentry webpack plugin integration
- `src/components/ErrorBoundary.tsx` - React error boundary with Sentry
- `src/lib/logger.ts` - Structured logging with Sentry integration
- `src/lib/error-handler.ts` - Standardized error handling with Sentry reporting

---

## Environment Variables

### Required

```env
# Sentry DSN (Data Source Name)
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_KEY@YOUR_REGION.ingest.sentry.io/YOUR_PROJECT_ID
```

### Optional (for source maps)

```env
# Sentry organization and project
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=your-project-slug

# Authentication token for uploading source maps
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

---

## Setup Instructions

### 1. Create Sentry Project

1. Go to https://sentry.io
2. Sign up or log in
3. Create a new project:
   - Platform: **Next.js**
   - Alert frequency: **On every new issue**
4. Copy the DSN from **Project Settings → Client Keys (DSN)**

### 2. Configure Environment Variables

**Local Development (.env.local):**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_KEY@YOUR_REGION.ingest.sentry.io/YOUR_PROJECT_ID
```

**Vercel Production:**
```bash
vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Paste your Sentry DSN when prompted
```

### 3. Optional: Setup Source Maps Upload

**Generate Auth Token:**
1. Go to **Settings → Auth Tokens**
2. Create new token with `project:releases` scope
3. Copy token

**Add to Vercel:**
```bash
vercel env add SENTRY_AUTH_TOKEN production
vercel env add SENTRY_ORG production
vercel env add SENTRY_PROJECT production
```

### 4. Verify Installation

```bash
# Install dependencies (already done)
npm install @sentry/nextjs winston react-error-boundary

# Build the project
npm run build

# Check for Sentry messages in build output
```

---

## Features Enabled

### Error Tracking
- ✅ Automatic error capture
- ✅ Error boundary integration
- ✅ Structured error context
- ✅ User feedback collection
- ✅ Error filtering and deduplication

### Performance Monitoring
- ✅ Transaction tracing (10% sample rate in production)
- ✅ API route monitoring
- ✅ Database query tracking
- ✅ HTTP client instrumentation
- ✅ Performance profiling (1% sample rate in production)

### Session Replay
- ✅ Error replay (10% of errors in production)
- ✅ Privacy protection (text/media masking)
- ⚠️ Session replay disabled by default (can be enabled)

### Integrations
- ✅ React error boundaries
- ✅ Winston logger integration
- ✅ Next.js automatic instrumentation
- ✅ Edge runtime support
- ✅ API route error tracking

---

## Error Filtering

Errors are automatically filtered to reduce noise:

### Ignored Errors (Client)
- Browser extension errors (`bis_skin_checked`, etc.)
- ResizeObserver errors (benign)
- Network errors in production
- Hydration warnings (handled separately)

### Ignored Errors (Server)
- Operational errors (ValidationError, NotFoundError, etc.)
- Expected network errors (ECONNREFUSED, ETIMEDOUT)

---

## Usage

### Manual Error Reporting

```typescript
import * as Sentry from '@sentry/nextjs';

// Capture an exception
try {
  throw new Error('Something went wrong');
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'payment' },
    contexts: {
      payment: {
        amount: 100,
        currency: 'AUD',
      },
    },
    level: 'error',
  });
}

// Capture a message
Sentry.captureMessage('Payment processed successfully', {
  level: 'info',
  tags: { feature: 'payment' },
});

// Add user context
Sentry.setUser({
  id: userId,
  email: userEmail,
  username: userName,
});
```

### Using Error Boundary

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

function MyPage() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### Using Logger with Sentry

```typescript
import { logger } from '@/lib/logger';

// Errors are automatically sent to Sentry
logger.error('Payment failed', {
  error: {
    message: error.message,
    stack: error.stack,
  },
  userId,
  amount,
});
```

### Using Error Handler

```typescript
import { createErrorResponse } from '@/lib/error-handler';

export async function POST(request: Request) {
  try {
    // Your code here
  } catch (error) {
    // Automatically logs to Sentry and returns formatted response
    return createErrorResponse(error);
  }
}
```

---

## Testing

### Test Error Tracking

Create a test endpoint to verify Sentry:

```typescript
// src/app/api/test-sentry/route.ts
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  // Trigger a test error
  Sentry.captureException(new Error('Test error from API'));

  return NextResponse.json({
    message: 'Test error sent to Sentry'
  });
}
```

Visit: `http://localhost:3000/api/test-sentry`

Check Sentry dashboard for the error.

### Test Error Boundary

Create a component that throws an error:

```typescript
function ErrorTestComponent() {
  throw new Error('Test error from component');
}
```

Wrap with ErrorBoundary and verify fallback UI displays.

---

## Monitoring

### Sentry Dashboard

1. **Issues:** https://sentry.io/organizations/YOUR_ORG/issues/
2. **Performance:** https://sentry.io/organizations/YOUR_ORG/performance/
3. **Releases:** https://sentry.io/organizations/YOUR_ORG/releases/

### Health Check

Monitor Sentry integration via health check endpoint:

```bash
curl http://localhost:3000/api/health
```

---

## Troubleshooting

### Errors not appearing in Sentry

1. **Check DSN:**
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. **Check Sentry initialization:**
   - Look for Sentry initialization messages in browser console
   - Check Network tab for Sentry requests

3. **Verify error isn't filtered:**
   - Check `ignoreErrors` in Sentry config
   - Verify error passes `beforeSend` filter

### Source maps not uploading

1. **Check auth token:**
   ```bash
   vercel env ls | grep SENTRY
   ```

2. **Check build output:**
   - Look for "Sentry: Uploading source maps" message
   - Verify no auth errors

3. **Manual upload:**
   ```bash
   npx sentry-cli sourcemaps upload \
     --org YOUR_ORG \
     --project YOUR_PROJECT \
     .next/static
   ```

### High event volume

1. **Adjust sample rates:**
   - Edit `tracesSampleRate` in Sentry configs
   - Reduce to 0.01 (1%) if needed

2. **Add more filters:**
   - Update `ignoreErrors` arrays
   - Add custom `beforeSend` logic

---

## Best Practices

### Do's ✅

- ✅ Add context to errors (user ID, transaction ID, etc.)
- ✅ Use structured tags for filtering
- ✅ Set appropriate error levels (error, warning, info)
- ✅ Add breadcrumbs for debugging
- ✅ Use custom fingerprints for grouping similar errors

### Don'ts ❌

- ❌ Send PII (personally identifiable information)
- ❌ Log secrets or API keys
- ❌ Send excessive events (set sample rates)
- ❌ Ignore all errors (be selective with filters)
- ❌ Forget to clear user context after logout

---

## Performance Impact

- **Bundle size increase:** ~30KB gzipped
- **Runtime overhead:** <1ms per transaction
- **Network requests:** ~1-2 per error (batched)
- **Source maps:** Build time +10-15 seconds

---

## Support & Resources

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Dashboard:** https://sentry.io
- **Status:** https://status.sentry.io
- **Support:** support@sentry.io

---

## Maintenance

### Monthly Tasks
- Review error trends
- Update ignored errors list
- Check quota usage
- Verify alerts working

### Quarterly Tasks
- Review sample rates
- Audit PII scrubbing
- Update Sentry SDK
- Performance analysis

---

**Last Updated:** January 9, 2025
**Maintained by:** Derrimut Platform Team
