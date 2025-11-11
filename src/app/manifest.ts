import { MetadataRoute } from 'next';
import { DERRIMUT_BRAND } from '@/constants/branding';

/**
 * Web App Manifest for PWA support
 * Enables install as app, splash screens, and app-like experience
 * 
 * Next.js automatically serves this at /manifest.json
 * If this doesn't work, fallback route handler at /manifest.json/route.ts will handle it
 */

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://derrimut-platform.vercel.app';
  
  return {
    name: DERRIMUT_BRAND.nameFull,
    short_name: DERRIMUT_BRAND.nameShort,
    description: `${DERRIMUT_BRAND.tagline} - AI-powered fitness platform with 24/7 access across Australia.`,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#ef4444',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['fitness', 'health', 'lifestyle'],
    screenshots: [
      {
        src: '/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Derrimut Platform Homepage',
      },
      {
        src: '/screenshot-narrow.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Derrimut Platform Mobile View',
      },
    ],
    shortcuts: [
      {
        name: 'Generate AI Plan',
        short_name: 'AI Plan',
        description: 'Generate your personalized fitness plan',
        url: '/generate-program',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Book Trainer',
        short_name: 'Trainer',
        description: 'Book a session with an expert trainer',
        url: '/trainer-booking',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Marketplace',
        short_name: 'Shop',
        description: 'Browse fitness products and supplements',
        url: '/marketplace',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}

