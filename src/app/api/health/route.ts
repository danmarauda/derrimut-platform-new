/**
 * Health Check API Endpoint
 *
 * Next.js 16 Best Practices:
 * - Proper route configuration
 * - Caching headers
 * - Error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * Health check response interface
 */
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail';
      message?: string;
      responseTime?: number;
    };
  };
  version: string;
  environment: string;
}

/**
 * Check Convex database connectivity
 */
async function checkConvexConnection(): Promise<{ status: 'pass' | 'fail'; message?: string; responseTime: number }> {
  const start = Date.now();

  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      return {
        status: 'fail',
        message: 'Convex URL not configured',
        responseTime: Date.now() - start,
      };
    }

    // Simple connectivity check (ping the Convex deployment)
    const response = await fetch(convexUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (response.ok || response.status === 404) {
      // 404 is expected for HEAD request to Convex URL
      return {
        status: 'pass',
        responseTime: Date.now() - start,
      };
    }

    return {
      status: 'fail',
      message: `Unexpected status: ${response.status}`,
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: error instanceof Error ? error.message : 'Connection failed',
      responseTime: Date.now() - start,
    };
  }
}

/**
 * Check Clerk authentication service
 */
async function checkClerkService(): Promise<{ status: 'pass' | 'fail'; message?: string; responseTime: number }> {
  const start = Date.now();

  try {
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (!clerkPublishableKey) {
      return {
        status: 'fail',
        message: 'Clerk publishable key not configured',
        responseTime: Date.now() - start,
      };
    }

    // Check if key format is valid
    if (!clerkPublishableKey.startsWith('pk_')) {
      return {
        status: 'fail',
        message: 'Invalid Clerk publishable key format',
        responseTime: Date.now() - start,
      };
    }

    return {
      status: 'pass',
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: error instanceof Error ? error.message : 'Service check failed',
      responseTime: Date.now() - start,
    };
  }
}

/**
 * Check environment variables
 */
function checkEnvironmentVariables(): { status: 'pass' | 'fail'; message?: string } {
  const requiredEnvVars = [
    'NEXT_PUBLIC_CONVEX_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    return {
      status: 'fail',
      message: `Missing environment variables: ${missingVars.join(', ')}`,
    };
  }

  return { status: 'pass' };
}

/**
 * GET /api/health
 *
 * Returns the health status of the application
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Run health checks in parallel
    const [convexCheck, clerkCheck] = await Promise.all([
      checkConvexConnection(),
      checkClerkService(),
    ]);

    const envCheck = checkEnvironmentVariables();

    // Determine overall status
    const allChecks = [convexCheck, clerkCheck, envCheck];
    const failedChecks = allChecks.filter((check) => check.status === 'fail');

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';

    if (failedChecks.length === 0) {
      overallStatus = 'healthy';
    } else if (failedChecks.length >= allChecks.length / 2) {
      overallStatus = 'unhealthy';
    } else {
      overallStatus = 'degraded';
    }

    // Build response
    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        convex: convexCheck,
        clerk: clerkCheck,
        environment: envCheck,
      },
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // Log health check
    const duration = Date.now() - startTime;
    logger.info('Health check completed', {
      status: overallStatus,
      duration,
      failedChecks: failedChecks.length,
    });

    // Return appropriate status code
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 207 : 503;

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    // Handle unexpected errors
    logger.error('Health check failed', {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack,
      } : undefined,
    });

    const errorResponse: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        error: {
          status: 'fail',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}

/**
 * HEAD /api/health
 *
 * Simple health check for load balancers (returns 200 if healthy)
 */
export async function HEAD() {
  try {
    // Quick check - just verify environment variables
    const envCheck = checkEnvironmentVariables();

    if (envCheck.status === 'pass') {
      return new NextResponse(null, { status: 200 });
    } else {
      return new NextResponse(null, { status: 503 });
    }
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}

// Next.js 16: Export route config
// Use Node.js runtime for process.uptime() access
// Health checks need Node.js APIs for comprehensive monitoring
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Cache health checks for 10 seconds to reduce load
export const revalidate = 10;
