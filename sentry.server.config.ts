/**
 * Sentry Server-Side Configuration
 *
 * This configuration is for the server-side of the application.
 * Runs in Node.js on the server.
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

  // Integration configuration
  integrations: [
    // HTTP integration for tracking HTTP requests
    Sentry.httpIntegration({
      failedRequestStatusCodes: [[400, 599]],
    }),
    // Note: nodeProfilingIntegration() disabled - not compatible with Turbopack in Next.js 15.2.4
    // Re-enable after upgrading to Next.js 15.4.1+
  ],

  // Error filtering
  beforeSend(event, hint) {
    // Filter out certain errors in production
    if (SENTRY_ENVIRONMENT === 'production') {
      const error = hint.originalException;

      // Ignore operational errors that are expected
      if (error && typeof error === 'object' && 'isOperational' in error) {
        // Only report non-operational errors (programming errors)
        if (error.isOperational) {
          return null;
        }
      }
    }

    return event;
  },

  // Add context to transactions
  beforeSendTransaction(transaction) {
    // Add custom tags
    transaction.tags = {
      ...transaction.tags,
      platform: 'server',
    };

    return transaction;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Operational errors (handled by application)
    'AuthenticationError',
    'ValidationError',
    'NotFoundError',
    // Network errors
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
  ],

  // Debug mode (only in development)
  debug: SENTRY_ENVIRONMENT === 'development',

  // Enable spotlight in development
  spotlight: SENTRY_ENVIRONMENT === 'development',

  // Attach server name
  serverName: process.env.VERCEL_REGION || 'local',

  // Sample rate for profiling (1% in production)
  profilesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.01 : 1.0,
});

// Export Sentry for use in API routes
export default Sentry;
