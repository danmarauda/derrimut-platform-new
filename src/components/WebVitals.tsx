"use client";

import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

/**
 * Web Vitals Monitoring Component
 * 
 * Tracks Core Web Vitals and sends to Vercel Analytics
 * Automatically integrated with Speed Insights
 * 
 * Metrics tracked:
 * - CLS (Cumulative Layout Shift)
 * - INP (Interaction to Next Paint) - replaces FID
 * - FCP (First Contentful Paint)
 * - LCP (Largest Contentful Paint)
 * - TTFB (Time to First Byte)
 * 
 * Note: FID is deprecated in web-vitals v5, use INP instead
 */
export function WebVitals() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Optional: Send to custom analytics
    // Vercel Speed Insights handles this automatically
    const sendToAnalytics = (metric: any) => {
      // Vercel Speed Insights automatically tracks these
      // Custom tracking can be added here if needed
      if (process.env.NODE_ENV === 'development') {
        console.log('Web Vital:', metric.name, metric.value);
      }
    };

    // Track all Core Web Vitals
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics); // INP replaces FID in web-vitals v5
  }, []);

  return null;
}

