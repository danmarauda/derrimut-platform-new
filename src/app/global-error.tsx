'use client';

import React from 'react';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);

    // Log to Sentry
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          errorBoundary: 'global',
        },
      });
    }
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #f9fafb, #e5e7eb)',
          padding: '1rem',
        }}>
          <div style={{
            maxWidth: '28rem',
            width: '100%',
            background: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              margin: '0 auto 1.5rem',
              background: '#fee2e2',
              borderRadius: '9999px',
            }}>
              <svg
                style={{ width: '2rem', height: '2rem', color: '#dc2626' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#111827',
              textAlign: 'center',
              marginBottom: '1rem',
            }}>
              Critical Error
            </h1>

            <p style={{
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}>
              A critical error occurred. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && error.message && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem',
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#991b1b',
                  marginBottom: '0.5rem',
                }}>
                  Error Details (Development Only):
                </p>
                <pre style={{
                  fontSize: '0.75rem',
                  color: '#b91c1c',
                  overflow: 'auto',
                  maxHeight: '8rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {error.message}
                </pre>
                {error.digest && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#dc2626',
                    marginTop: '0.5rem',
                  }}>
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={reset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: '#2563eb',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.href = '/'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: '#e5e7eb',
                  color: '#111827',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Go Home
              </button>
            </div>

            <p style={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              textAlign: 'center',
              marginTop: '1.5rem',
            }}>
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
