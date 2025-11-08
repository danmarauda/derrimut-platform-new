/**
 * Sentry Client-Side Configuration
 *
 * This configuration is for the browser/client-side of the application.
 * Runs in the user's browser.
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NODE_ENV || 'development';
const SENTRY_RELEASE = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development';

Sentry.init({
  // Your Sentry DSN (Data Source Name)
  dsn: SENTRY_DSN,

  // Environment (development, staging, production)
  environment: SENTRY_ENVIRONMENT,

  // Release version for tracking
  release: SENTRY_RELEASE,

  // Capture rate for performance monitoring (10% in production)
  tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // Session replay sample rate (10% of errors in production)
  replaysSessionSampleRate: 0.0, // Disabled by default
  replaysOnErrorSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // Integration configuration
  integrations: [
    // Replay integration for session recording
    Sentry.replayIntegration({
      maskAllText: true, // Privacy: mask all text
      blockAllMedia: true, // Privacy: block all media
    }),

    // Browser tracing for performance monitoring
    Sentry.browserTracingIntegration({
      // Tracing Origins
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/derrimut\.aliaslabs\.ai/,
        /^https:\/\/.*\.convex\.cloud/,
      ],
    }),

    // HTTP client integration
    Sentry.httpClientIntegration({
      failedRequestStatusCodes: [[400, 599]], // Report failed requests
    }),
  ],

  // Error filtering
  beforeSend(event, hint) {
    // Filter out certain errors in production
    if (SENTRY_ENVIRONMENT === 'production') {
      const error = hint.originalException;

      // Ignore browser extension errors
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

      // Ignore network errors
      if (event.exception?.values?.[0]?.type === 'NetworkError') {
        return null;
      }
    }

    return event;
  },

  // Add user context
  beforeSendTransaction(transaction) {
    // Add custom tags
    transaction.tags = {
      ...transaction.tags,
      platform: 'client',
    };

    return transaction;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extension errors
    'bis_skin_checked',
    'bis_register',
    // Resize observer errors (benign)
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Network errors
    'NetworkError',
    'Failed to fetch',
    // Hydration warnings (handled separately)
    'Hydration failed',
    'There was an error while hydrating',
  ],

  // Deny URLs (don't track errors from these sources)
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
    // Third-party scripts
    /google-analytics\.com/i,
    /googletagmanager\.com/i,
  ],

  // Debug mode (only in development)
  debug: SENTRY_ENVIRONMENT === 'development',

  // Enable auto session tracking
  autoSessionTracking: true,

  // Send client reports
  sendClientReports: true,
});

// Export Sentry for use in components
export default Sentry;
