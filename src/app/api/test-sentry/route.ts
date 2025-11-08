/**
 * Sentry Test Endpoint
 *
 * This endpoint is for testing Sentry error tracking.
 * Remove or protect this endpoint in production.
 */

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

/**
 * GET /api/test-sentry
 *
 * Test Sentry error tracking by triggering various error types
 */
export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoint disabled in production' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('type') || 'error';

  logger.info('Testing Sentry', { testType });

  switch (testType) {
    case 'error':
      // Test basic error tracking
      Sentry.captureException(new Error('Test error from API endpoint'), {
        tags: {
          test: true,
          endpoint: 'test-sentry',
        },
        contexts: {
          test: {
            type: 'error',
            timestamp: new Date().toISOString(),
          },
        },
      });
      break;

    case 'message':
      // Test message tracking
      Sentry.captureMessage('Test message from API endpoint', {
        level: 'info',
        tags: {
          test: true,
          endpoint: 'test-sentry',
        },
      });
      break;

    case 'throw':
      // Test unhandled error (will be caught by Next.js error handler)
      throw new Error('Test unhandled error');

    case 'logger':
      // Test logger integration
      logger.error('Test error from logger', {
        error: {
          message: 'This is a test error',
          name: 'TestError',
        },
        userId: 'test-user-123',
        test: true,
      });
      break;

    case 'performance':
      // Test performance tracking
      const transaction = Sentry.startTransaction({
        op: 'test',
        name: 'Test Transaction',
      });

      const span = transaction.startChild({
        op: 'test-operation',
        description: 'Testing Sentry performance tracking',
      });

      // Simulate some work
      await new Promise((resolve) => setTimeout(resolve, 100));

      span.finish();
      transaction.finish();
      break;

    default:
      return NextResponse.json(
        { error: 'Invalid test type' },
        { status: 400 }
      );
  }

  return NextResponse.json({
    success: true,
    message: `Sentry ${testType} test triggered`,
    note: 'Check your Sentry dashboard for the event',
    dashboard: 'https://sentry.io',
  });
}

/**
 * POST /api/test-sentry
 *
 * Test custom error context
 */
export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoint disabled in production' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    // Set user context
    Sentry.setUser({
      id: 'test-user-123',
      email: 'test@example.com',
      username: 'Test User',
    });

    // Add breadcrumbs
    Sentry.addBreadcrumb({
      category: 'test',
      message: 'Testing custom context',
      level: 'info',
      data: body,
    });

    // Capture error with custom context
    Sentry.captureException(new Error('Test error with custom context'), {
      tags: {
        test: true,
        feature: 'payment',
      },
      contexts: {
        payment: {
          amount: body.amount || 100,
          currency: 'AUD',
          method: 'card',
        },
        user: {
          membership: 'premium',
          venue: 'richmond',
        },
      },
      extra: {
        requestBody: body,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Error with custom context sent to Sentry',
      note: 'Check Sentry dashboard for the event with payment context',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send test error' },
      { status: 500 }
    );
  }
}
