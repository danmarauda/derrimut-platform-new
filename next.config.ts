import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Bundle Analyzer (optional, run with ANALYZE=true npm run build)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {

  // Next.js 16: Enhanced image optimization
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Next.js 16: Enable modern image formats
    formats: ['image/avif', 'image/webp'],
  },

  // Next.js 16: React 19 optimizations
  reactStrictMode: true,
  
  // Next.js 16: Enhanced compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable gzip compression
  // Note: SWC minification is default in Next.js 16, no need to specify

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-accordion', '@radix-ui/react-dropdown-menu'],
  },

  // Security Headers - Task 4.3: Comprehensive Security Headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://clerk.derrimut.aliaslabs.ai https://js.stripe.com https://cdn.vapi.ai https://browser.sentry-cdn.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.convex.cloud https://clerk.com https://*.clerk.accounts.dev https://accounts.derrimut.aliaslabs.ai https://clerk.derrimut.aliaslabs.ai https://api.stripe.com https://api.vapi.ai https://generativelanguage.googleapis.com https://*.sentry.io wss://*.convex.cloud https://vapi.ai",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://clerk.com https://*.clerk.accounts.dev",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Sentry organization and project
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppress all logs in production
  silent: process.env.NODE_ENV === 'production',

  // Upload source maps in production only
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Hide source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically annotate React components to show in Sentry
  reactComponentAnnotation: {
    enabled: true,
  },
};

// Export configuration with Sentry and Bundle Analyzer
export default withBundleAnalyzer(
  withSentryConfig(nextConfig, sentryWebpackPluginOptions)
);
