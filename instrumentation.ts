/**
 * Next.js Instrumentation File
 *
 * This file is used to initialize observability tools (Sentry, OpenTelemetry, etc.)
 * It runs once when the server starts up.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Initialize Sentry based on runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side initialization
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime initialization
    await import('./sentry.edge.config');
  }

  // Client-side initialization happens in sentry.client.config.ts
  // which is automatically loaded by Next.js
}

// Optional: Define experimental features
export const onRequestError = async (
  err: Error,
  request: {
    path: string;
    method: string;
    headers: Headers;
  }
) => {
  // This function is called when an unhandled error occurs during request processing
  // You can use it for additional error reporting or logging

  console.error('Unhandled request error:', {
    error: err.message,
    path: request.path,
    method: request.method,
  });

  // Sentry will automatically capture this error via the server config
};
