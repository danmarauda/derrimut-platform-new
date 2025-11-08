'use client';

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
          Oops! Something went wrong
        </h1>

        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          We're sorry for the inconvenience. An unexpected error occurred.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
              Error Details (Development Only):
            </p>
            <pre className="text-xs text-red-700 dark:text-red-400 overflow-auto max-h-32">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetErrorBoundary}
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

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function ErrorBoundary({ children, onError }: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    onError?.(error, errorInfo);

    // Log to Sentry or other error tracking service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Reset the state of your app here
        window.location.href = window.location.pathname;
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export default ErrorBoundary;
