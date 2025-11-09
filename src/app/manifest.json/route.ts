import { NextResponse } from 'next/server';
import { DERRIMUT_BRAND } from '@/constants/branding';

/**
 * Manifest.json Route Handler
 * Fallback route handler for manifest.json if manifest.ts doesn't work
 * Next.js 16 should handle manifest.ts automatically, but this ensures it works
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://derrimut-platform.vercel.app';
  
  const manifest = {
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

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

