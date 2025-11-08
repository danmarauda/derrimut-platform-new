/**
 * Sentry Edge Runtime Configuration
 *
 * This configuration is for Edge Runtime (middleware, edge functions).
 * Runs on Vercel Edge Network.
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

  // Capture rate for performance monitoring (5% in production)
  tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.05 : 1.0,

  // Add context to events
  beforeSend(event, hint) {
    // Add edge runtime tag
    event.tags = {
      ...event.tags,
      runtime: 'edge',
    };

    return event;
  },

  // Add context to transactions
  beforeSendTransaction(transaction) {
    // Add custom tags
    transaction.tags = {
      ...transaction.tags,
      platform: 'edge',
      runtime: 'edge',
    };

    return transaction;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Operational errors
    'AuthenticationError',
    'ValidationError',
    // Network errors
    'NetworkError',
    'Failed to fetch',
  ],

  // Debug mode (only in development)
  debug: SENTRY_ENVIRONMENT === 'development',
});

// Export Sentry for use in middleware
export default Sentry;
