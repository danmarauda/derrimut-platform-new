# Sentry + Next.js 16 Setup Guide

## Current Setup

- **Sentry Version**: `@sentry/nextjs@^10.23.0`
- **Next.js Version**: `16.0.1`
- **Status**: ✅ Configured and working

## Configuration Files

### 1. Client Configuration (`sentry.client.config.ts`)

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay (disabled by default)
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
    Sentry.httpClientIntegration(),
  ],
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter browser extension errors
    if (process.env.NODE_ENV === 'production') {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message);
        if (
          message.includes('bis_skin_checked') ||
          message.includes('bis_register') ||
          message.includes('ResizeObserver loop') ||
          message.includes('Non-Error promise rejection')
        ) {
          return null;
        }
      }
    }
    return event;
  },
  
  // Ignore specific errors
  ignoreErrors: [
    'bis_skin_checked',
    'bis_register',
    'ResizeObserver loop limit exceeded',
    'NetworkError',
    'Failed to fetch',
    'Hydration failed',
  ],
  
  // Deny URLs from browser extensions
  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
    /google-analytics\.com/i,
    /googletagmanager\.com/i,
  ],
  
  debug: process.env.NODE_ENV === 'development',
});
```

### 2. Server Configuration (`sentry.server.config.ts`)

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',
  
  // Performance monitoring (lower sample rate for server)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  
  // Integrations
  integrations: [
    Sentry.httpIntegration(),
  ],
  
  // Error filtering
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === 'production') {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'isOperational' in error) {
        if (error.isOperational) {
          return null; // Don't report operational errors
        }
      }
    }
    return event;
  },
  
  ignoreErrors: [
    'AuthenticationError',
    'ValidationError',
    'NotFoundError',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
  ],
  
  debug: process.env.NODE_ENV === 'development',
  spotlight: process.env.NODE_ENV === 'development',
  serverName: process.env.VERCEL_REGION || 'local',
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 1.0,
});
```

### 3. Edge Configuration (`sentry.edge.config.ts`)

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',
  
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  
  beforeSend(event, hint) {
    event.tags = {
      ...event.tags,
      runtime: 'edge',
    };
    return event;
  },
  
  ignoreErrors: [
    'AuthenticationError',
    'ValidationError',
    'NetworkError',
    'Failed to fetch',
  ],
  
  debug: process.env.NODE_ENV === 'development',
});
```

## Performance Monitoring API

### ✅ Correct: Using `startSpan` (New API)

```typescript
import * as Sentry from '@sentry/nextjs';

// Correct usage for Sentry v10+
await Sentry.startSpan({
  op: 'test',
  name: 'Test Transaction',
}, async (span) => {
  await Sentry.startSpan({
    op: 'test-operation',
    description: 'Testing Sentry performance tracking',
  }, async () => {
    // Your code here
    await someAsyncOperation();
  });
});
```

### ❌ Deprecated: `startTransaction` (Old API)

```typescript
// This is deprecated and no longer available
const transaction = Sentry.startTransaction({ ... }); // ❌ Not available
```

## Available Sentry APIs (v10.23.0)

Based on the installed package, these are the available span/transaction APIs:

- ✅ `startSpan` - Modern API for performance monitoring
- ✅ `startSpanManual` - Manual span management
- ✅ `startInactiveSpan` - Create inactive spans
- ✅ `getActiveSpan` - Get current active span
- ✅ `getRootSpan` - Get root span
- ✅ `withActiveSpan` - Execute code with active span
- ❌ `startTransaction` - Deprecated/removed

## Integration Options

### Client-Side Integrations

- `replayIntegration()` - Session replay
- `browserTracingIntegration()` - Browser performance tracing
- `httpClientIntegration()` - HTTP client request tracking

### Server-Side Integrations

- `httpIntegration()` - HTTP server request tracking
- `nodeProfilingIntegration()` - Node.js profiling (requires `@sentry/profiling-node`)

## Environment Variables

Required:
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN (public, exposed to client)

Optional:
- `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` - Release version for tracking
- `NODE_ENV` - Environment (development/production)

## Best Practices

1. **Sample Rates**:
   - Client: 10% in production (`0.1`)
   - Server: 5% in production (`0.05`)
   - Edge: 5% in production (`0.05`)

2. **Error Filtering**:
   - Filter browser extension errors
   - Filter operational errors (handled by app)
   - Filter network errors in production

3. **Privacy**:
   - Mask all text in session replay
   - Block all media in session replay
   - Remove sensitive data in `beforeSend`

4. **Performance**:
   - Use appropriate sample rates to avoid overhead
   - Enable profiling only when needed
   - Use `startSpan` for custom performance tracking

## Testing

Test endpoint available at `/api/test-sentry` (development only):

```bash
# Test error tracking
curl http://localhost:3000/api/test-sentry?type=error

# Test message tracking
curl http://localhost:3000/api/test-sentry?type=message

# Test performance tracking
curl http://localhost:3000/api/test-sentry?type=performance
```

## Deployment

1. Set `NEXT_PUBLIC_SENTRY_DSN` in Vercel environment variables
2. Source maps are automatically uploaded during build
3. Verify errors appear in Sentry dashboard after deployment

## References

- [Sentry Next.js Documentation](https://docs.sentry.dev/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Session Replay](https://docs.sentry.io/product/session-replay/)

