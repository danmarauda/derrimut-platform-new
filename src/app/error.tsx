'use client';

import React from 'react';
import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Page error:', error);

    // Log to Sentry
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          errorBoundary: 'page-level',
        },
      });
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
          Something went wrong!
        </h1>

        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          We encountered an error while loading this page.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
              Error Details (Development Only):
            </p>
            <pre className="text-xs text-red-700 dark:text-red-400 overflow-auto max-h-32">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
