/**
 * Sentry Test Endpoint
 *
 * Next.js 16 Best Practices:
 * - Proper route configuration
 * - Environment-aware behavior
 * - Type-safe error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

/**
 * GET /api/test-sentry
 *
 * Test Sentry error tracking by triggering various error types
 */
export async function GET(request: NextRequest) {
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

  try {
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
        // Test performance tracking using Sentry.startSpan (new API)
        await Sentry.startSpan({
          op: 'test',
          name: 'Test Transaction',
        }, async (span) => {
          await Sentry.startSpan({
            op: 'test-operation',
            name: 'Testing Sentry performance tracking',
          }, async () => {
            // Simulate some work
            await new Promise((resolve) => setTimeout(resolve, 100));
          });
        });
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
    }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Sentry test failed', { 
      error: error instanceof Error 
        ? { message: error.message, name: error.name, stack: error.stack }
        : { message: errorMessage, name: 'UnknownError' }
    });
    
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/test-sentry
 *
 * Test custom error context
 */
export async function POST(request: NextRequest) {
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
    }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to send test error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// Next.js 16: Export route config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
