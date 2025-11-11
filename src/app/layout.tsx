import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

import ConvexClerkProvider from "@/providers/ConvexClerkProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbaseWidget from "@/components/ChatbaseWidget";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { WebVitals } from "@/components/WebVitals";

// Task 1.6: Validate environment variables on app startup
// The env validation happens automatically on module import
import "@/lib/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
  preload: false, // Only preload primary font
  fallback: ['monospace'],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'arial'],
  weight: ['300', '400', '500', '600'],
});

import { DERRIMUT_BRAND } from "@/constants/branding";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://derrimut-platform.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: DERRIMUT_BRAND.nameFull,
    template: `%s | ${DERRIMUT_BRAND.nameFull}`,
  },
  description: `${DERRIMUT_BRAND.tagline} - ${DERRIMUT_BRAND.nameFull} - AI-powered fitness platform with 24/7 access across Australia.`,
  keywords: [
    'fitness',
    'gym',
    'workout',
    'AI fitness',
    'personal trainer',
    'nutrition',
    'Derrimut',
    '24/7 gym',
    'Australia gym',
    'fitness platform',
    'workout plans',
    'diet plans',
  ],
  authors: [{ name: DERRIMUT_BRAND.nameFull }],
  creator: DERRIMUT_BRAND.nameFull,
  publisher: DERRIMUT_BRAND.nameFull,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: baseUrl,
    siteName: DERRIMUT_BRAND.nameFull,
    title: DERRIMUT_BRAND.nameFull,
    description: `${DERRIMUT_BRAND.tagline} - AI-powered fitness platform with 24/7 access across Australia.`,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: DERRIMUT_BRAND.nameFull,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DERRIMUT_BRAND.nameFull,
    description: `${DERRIMUT_BRAND.tagline} - AI-powered fitness platform.`,
    images: ['/og-image.png'],
    creator: '@derrimut247',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: baseUrl,
  },
  category: 'fitness',
};

// Client component to handle browser extension detection
const BrowserExtensionHandler = () => {
  if (typeof window !== 'undefined') {
    // More comprehensive hydration warning suppression
    const script = `
      (function() {
        if (typeof window !== 'undefined') {
          // Override React's hydration error logging
          const originalConsoleError = console.error;
          console.error = function(...args) {
            const message = args[0];
            if (typeof message === 'string' && (
              message.includes('bis_skin_checked') ||
              message.includes('bis_register') ||
              message.includes('Hydration failed') ||
              message.includes('server rendered HTML didn\\'t match') ||
              message.includes('A tree hydrated but some attributes')
            )) {
              // Silently ignore browser extension hydration warnings
              return;
            }
            originalConsoleError.apply(console, args);
          };

          // Prevent React from detecting extension attributes during hydration
          const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              if (mutation.type === 'attributes' && mutation.target) {
                const target = mutation.target;
                // Remove extension attributes immediately when they're added
                ['bis_skin_checked', 'bis_register', '__processed_de166b46-1091-4dfa-abce-c1472b867b71__'].forEach(function(attr) {
                  if (target.hasAttribute && target.hasAttribute(attr)) {
                    target.removeAttribute(attr);
                  }
                });
              }
            });
          });

          // Start observing after a delay to let React hydrate first
          setTimeout(function() {
            if (document.body) {
              observer.observe(document.body, {
                attributes: true,
                subtree: true,
                attributeFilter: ['bis_skin_checked', 'bis_register', '__processed_de166b46-1091-4dfa-abce-c1472b867b71__']
              });
            }
          }, 100);
        }
      })();
    `;
    
    return (
      <script 
        dangerouslySetInnerHTML={{ __html: script }}
        suppressHydrationWarning
      />
    );
  }
  return null;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body 
          className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased min-h-screen flex flex-col`}
          suppressHydrationWarning={true}
        >
          <ThemeProvider>
            <ErrorBoundary>
              <Navbar />

              {/* PREMIUM DARK BACKGROUND - Based on reference design system */}
              <div className="fixed inset-0 -z-10 bg-neutral-950" suppressHydrationWarning>
                {/* Subtle grid pattern - only visible in dark mode */}
                <div className="dark:absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" suppressHydrationWarning></div>
                {/* Subtle radial gradients for depth */}
                <div className="dark:absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.03)_0%,transparent_50%)]" suppressHydrationWarning></div>
                <div className="dark:absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.02)_0%,transparent_50%)]" suppressHydrationWarning></div>
              </div>

              <main className="flex-1 relative z-10">{children}</main>
              <Footer />
              <ChatbaseWidget />
            </ErrorBoundary>
          </ThemeProvider>
          <Analytics />
          <SpeedInsights />
          <WebVitals />
          <BrowserExtensionHandler />
        </body>
      </html>
    </ConvexClerkProvider>
  );
}
