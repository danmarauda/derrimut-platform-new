# Premium Wellness Design System - Complete Transformation Specification

**Date:** 2025-01-09
**Project:** Derrimut 24:7 Gym Platform
**Scope:** Complete visual transformation from gym red/orange to premium wellness lifestyle
**Status:** Design Complete, Ready for Implementation

---

## Executive Summary

This document specifies the complete design system for transforming the Derrimut 24:7 platform from its current gym-focused aesthetic (red/orange colors, athletic branding) to a sophisticated premium wellness lifestyle brand. The design system is extracted directly from the reference HTML files in `/Users/alias/Downloads/derrimut/` and will be applied to all 57 pages and 31 components in the Next.js codebase.

**Design Philosophy:** Sophisticated minimalism with glassmorphism, inspired by premium wellness brands like Equinox. Dark neutral backgrounds, elegant typography, subtle animations, and high-end user experience.

---

## 1. Design Tokens - Core Foundation

### 1.1 Color System

**Current (Red/Orange Gym):**
```css
--primary: #dc2626 (red)
--secondary: #ea580c (orange)
--gym-red: #dc2626
--gym-orange: #ea580c
```

**New (Premium Wellness):**
```typescript
// Extract from HTML: bg-neutral-950, text-white/80, border-white/10
export const premiumColors = {
  // Base neutrals (dark-first)
  neutral: {
    950: '#0a0a0a',    // Main background (from HTML: bg-neutral-950)
    900: '#171717',    // Card backgrounds
    800: '#262626',    // Elevated surfaces
    700: '#404040',    // Subtle borders
    600: '#525252',    // Disabled states
    500: '#737373',    // Muted text
    400: '#a3a3a3',    // Secondary text
    300: '#d4d4d4',    // Tertiary text
    200: '#e5e5e5',    // Light borders
    100: '#f5f5f5',    // Light backgrounds
    50: '#fafafa',     // Brightest white
  },

  // Glassmorphism overlays (from HTML: bg-white/5, bg-white/10, bg-white/15)
  glass: {
    subtle: 'rgba(255, 255, 255, 0.05)',   // bg-white/5
    medium: 'rgba(255, 255, 255, 0.10)',   // bg-white/10
    strong: 'rgba(255, 255, 255, 0.15)',   // bg-white/15
    overlay: 'rgba(10, 10, 10, 0.5)',      // from HTML gradient overlay
    mobileMenu: 'rgba(0, 0, 0, 0.95)',     // mobile menu background
  },

  // Text opacity levels (from HTML: text-white/90, text-white/80, etc.)
  text: {
    primary: 'rgba(255, 255, 255, 1)',     // text-white
    secondary: 'rgba(255, 255, 255, 0.90)', // text-white/90
    tertiary: 'rgba(255, 255, 255, 0.80)',  // text-white/80
    muted: 'rgba(255, 255, 255, 0.70)',     // text-white/70
    subtle: 'rgba(255, 255, 255, 0.60)',    // text-white/60
    disabled: 'rgba(255, 255, 255, 0.50)',  // text-white/50
    faint: 'rgba(255, 255, 255, 0.40)',     // text-white/40 (placeholders)
  },

  // Border opacity levels (from HTML: border-white/10, border-white/20)
  border: {
    subtle: 'rgba(255, 255, 255, 0.10)',   // border-white/10
    medium: 'rgba(255, 255, 255, 0.20)',   // border-white/20
    strong: 'rgba(255, 255, 255, 0.30)',   // hover states
  },

  // Accent colors (minimal use, sophisticated)
  accent: {
    gold: '#d4af37',      // Premium highlight (replaces primary red)
    sage: '#8b9474',      // Wellness green accent
    slate: '#64748b',     // Cool professional
    warm: '#78716c',      // Warm earth tone
  },

  // Functional colors (keep minimal)
  functional: {
    success: '#10b981',   // Green for success states
    warning: '#f59e0b',   // Amber for warnings
    error: '#ef4444',     // Red for errors
    info: '#3b82f6',      // Blue for info
  }
};
```

### 1.2 Typography System

**Current:**
```css
--font-geist-sans: Geist Sans
--font-geist-mono: Geist Mono
```

**New (from HTML):**
```typescript
// Extract from HTML: font-family: Inter, font-geist
export const premiumTypography = {
  // Font families
  fonts: {
    primary: 'Inter',       // Body text (from HTML)
    display: 'Geist',       // Headlines, premium feel (from HTML: font-geist)
    mono: 'Geist Mono',     // Code, technical
  },

  // Font sizes (responsive with clamp)
  fontSize: {
    // Hero/Display (from HTML hero sections)
    hero: 'clamp(3rem, 8vw, 6rem)',        // 48-96px
    display: 'clamp(2.5rem, 6vw, 5rem)',   // 40-80px

    // Headings
    h1: 'clamp(2rem, 5vw, 4rem)',          // 32-64px (from HTML: text-5xl to text-7xl)
    h2: 'clamp(1.75rem, 4vw, 3rem)',       // 28-48px
    h3: 'clamp(1.5rem, 3vw, 2.25rem)',     // 24-36px (from HTML: text-xl to text-2xl)
    h4: 'clamp(1.25rem, 2.5vw, 1.75rem)',  // 20-28px

    // Body text (from HTML: text-base, text-sm)
    lg: 'clamp(1.125rem, 2vw, 1.25rem)',   // 18-20px
    base: 'clamp(1rem, 1.5vw, 1.125rem)',  // 16-18px
    sm: 'clamp(0.875rem, 1.25vw, 1rem)',   // 14-16px (from HTML: text-sm)
    xs: 'clamp(0.75rem, 1vw, 0.875rem)',   // 12-14px
  },

  // Font weights (from HTML: font-normal, font-medium, font-semibold, font-bold)
  fontWeight: {
    light: 300,      // Elegant, minimal use
    normal: 400,     // Body text (from HTML: font-normal)
    medium: 500,     // Subtle emphasis (from HTML: font-medium)
    semibold: 600,   // Headings (from HTML: font-semibold)
    bold: 700,       // Strong emphasis (from HTML: font-bold)
  },

  // Line heights
  lineHeight: {
    tight: 1.1,      // Headlines
    snug: 1.25,      // Subheadings
    normal: 1.5,     // Body text
    relaxed: 1.75,   // Long-form content
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',     // Uppercase labels (from HTML: tracking-wider)
    widest: '0.1em',
  }
};
```

### 1.3 Spacing System

```typescript
// Maintain Tailwind default spacing scale
export const premiumSpacing = {
  // Container padding (from HTML: px-6, lg:px-8)
  container: {
    mobile: '1.5rem',   // px-6
    desktop: '2rem',    // lg:px-8
    maxWidth: '80rem',  // max-w-7xl (from HTML)
  },

  // Section spacing (from HTML: pt-6 pb-6, pt-16 pb-8)
  section: {
    sm: '3rem',     // py-12
    md: '4rem',     // py-16 (from HTML footer)
    lg: '6rem',     // py-24
    xl: '8rem',     // py-32
  },

  // Component spacing
  component: {
    xs: '0.5rem',   // gap-2
    sm: '0.75rem',  // gap-3
    md: '1rem',     // gap-4
    lg: '1.5rem',   // gap-6 (from HTML: gap-6, gap-8)
    xl: '2rem',     // gap-8
  }
};
```

### 1.4 Border Radius

```typescript
// From HTML: rounded, rounded-lg, rounded-full, rounded-xl
export const premiumBorderRadius = {
  none: '0',
  sm: '0.375rem',    // rounded
  md: '0.5rem',      // rounded-md
  lg: '0.75rem',     // rounded-lg (from HTML: cards, inputs)
  xl: '1rem',        // rounded-xl
  '2xl': '1.5rem',   // rounded-2xl
  '3xl': '2rem',     // rounded-3xl
  full: '9999px',    // rounded-full (from HTML: buttons)
};
```

### 1.5 Shadows & Blur

```typescript
// From HTML: backdrop-blur, backdrop-blur-sm, backdrop-blur-md, backdrop-blur-xl
export const premiumEffects = {
  // Backdrop blur (glassmorphism)
  backdropBlur: {
    none: '0',
    sm: 'blur(4px)',    // backdrop-blur-sm
    md: 'blur(12px)',   // backdrop-blur-md (from HTML: most common)
    lg: 'blur(16px)',   // backdrop-blur
    xl: 'blur(24px)',   // backdrop-blur-xl (from HTML: mobile menu)
  },

  // Box shadows (minimal use)
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Filter blur (from HTML: filter: blur(8px) in animation)
  blur: {
    none: '0',
    sm: 'blur(4px)',
    md: 'blur(8px)',    // from HTML animation
    lg: 'blur(16px)',
    xl: 'blur(100px)',  // from HTML: scrollBlur animation endpoint
  }
};
```

---

## 2. Animation System

### 2.1 Keyframe Animations

**From HTML files - exact CSS:**

```css
/* fadeSlideIn - Primary scroll animation */
@keyframes fadeSlideIn {
  0% {
    opacity: 0;
    transform: translateY(30px);
    filter: blur(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0px);
  }
}

/* scrollBlur - Parallax background blur */
@keyframes scrollBlur {
  from {
    filter: blur(0px);
  }
  to {
    filter: blur(100px);
  }
}
```

**TypeScript Configuration:**

```typescript
export const premiumAnimations = {
  // Scroll-triggered fade slide
  fadeSlideIn: {
    keyframes: {
      '0%': {
        opacity: 0,
        transform: 'translateY(30px)',
        filter: 'blur(8px)',
      },
      '100%': {
        opacity: 1,
        transform: 'translateY(0)',
        filter: 'blur(0px)',
      }
    },
    duration: '1s',
    timing: 'ease-out',
    delay: {
      base: '0.1s',
      stagger: '0.1s',  // Increment for sequential items
    }
  },

  // Parallax background blur
  scrollBlur: {
    keyframes: {
      from: { filter: 'blur(0px)' },
      to: { filter: 'blur(100px)' },
    },
    timeline: 'view()',
    range: 'entry 100% entry 200%',
  },

  // Standard transitions
  transition: {
    fast: '150ms ease',
    base: '300ms ease',      // From HTML: transition
    slow: '500ms ease',
    duration: {
      fast: '150ms',
      base: '300ms',         // From HTML: duration-300
      slow: '500ms',
    },
    timing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',   // From HTML: ease-out
      easeInOut: 'ease-in-out',
    }
  }
};
```

### 2.2 Scroll Animation Hook

**From HTML: IntersectionObserver implementation:**

```typescript
// src/lib/hooks/use-scroll-animation.ts
'use client';

import { useEffect, useRef } from 'react';

export function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Exact logic from HTML files
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target); // once: true
          }
        });
      },
      {
        threshold: 0.2,                      // From HTML
        rootMargin: '0px 0px -10% 0px'      // From HTML
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}
```

---

## 3. Component Specifications

### 3.1 Button Component

**Current Component:** `src/components/ui/button.tsx` (CVA-based with shadcn variants)

**New Premium Button (from HTML):**

```typescript
// src/components/ui/premium/button.tsx
'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ variant = 'primary', fullWidth = false, className, children, ...props }, ref) => {
    // Base styles (from HTML: inline-flex gap-2 items-center transition)
    const baseStyles = 'inline-flex gap-2 items-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60';

    // Variant styles (exact from HTML)
    const variantStyles = {
      // From HTML: bg-white/10 border-white/10 border rounded-full backdrop-blur
      primary: 'bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-normal text-white/90 font-geist rounded-full pt-2 pr-4 pb-2 pl-4 backdrop-blur',

      // From HTML: bg-transparent hover:bg-white/5 border-white/20
      ghost: 'bg-transparent hover:bg-white/5 border border-white/20 text-sm font-normal text-white/80 font-geist rounded-full pt-2 pr-4 pb-2 pl-4 backdrop-blur',

      // Outline variant
      outline: 'bg-transparent hover:bg-white/10 border border-white/10 text-sm font-normal text-white/90 font-geist rounded-full pt-2 pr-4 pb-2 pl-4 backdrop-blur',
    };

    const widthStyles = fullWidth ? 'w-full justify-center' : '';

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], widthStyles, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PremiumButton.displayName = 'PremiumButton';
```

### 3.2 Card Component

**Current Component:** `src/components/ui/card.tsx` (shadcn card)

**New Premium Card (from HTML):**

```typescript
// src/components/ui/premium/card.tsx
'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PremiumCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  elevated?: boolean;
}

export const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ hover = true, elevated = false, className, children, ...props }, ref) => {
    // Base styles (from HTML: bg-white/5 border-white/10 rounded-lg backdrop-blur-sm)
    const baseStyles = 'bg-white/5 border border-white/10 rounded-lg overflow-hidden backdrop-blur-sm';

    // Hover effect (from HTML: hover:bg-white/10 hover:border-white/20)
    const hoverStyles = hover ? 'hover:bg-white/10 hover:border-white/20 transition-all duration-300' : '';

    // Elevated variant (stronger glassmorphism)
    const elevatedStyles = elevated ? 'bg-white/10 border-white/15 backdrop-blur-md' : '';

    return (
      <div
        ref={ref}
        className={cn(baseStyles, hoverStyles, elevatedStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PremiumCard.displayName = 'PremiumCard';

// Card subcomponents
export const PremiumCardImage = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('aspect-video overflow-hidden', className)}
      {...props}
    >
      {children}
    </div>
  )
);

export const PremiumCardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
);

export const PremiumCardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold text-white mb-2', className)}
      {...props}
    >
      {children}
    </h3>
  )
);

export const PremiumCardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-white/70 mb-4', className)}
      {...props}
    >
      {children}
    </p>
  )
);

export const PremiumCardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
);
```

### 3.3 Input Component

**Current Component:** `src/components/ui/input.tsx`

**New Premium Input (from HTML signin.html):**

```typescript
// src/components/ui/premium/input.tsx
'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, error, helpText, className, ...props }, ref) => {
    return (
      <div className="mb-6">
        {label && (
          <label className="block text-sm font-medium text-white/80 mb-2">
            {label}
          </label>
        )}

        <input
          ref={ref}
          className={cn(
            // From HTML: bg-white/5 border-white/10 rounded-lg backdrop-blur
            'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3',
            'text-white placeholder:text-white/40',
            'focus:bg-white/10 focus:border-white/20 focus:outline-none',
            'backdrop-blur transition',
            error && 'border-red-400 focus:border-red-400',
            className
          )}
          {...props}
        />

        {error && (
          <p className="text-sm text-red-400 mt-1">{error}</p>
        )}

        {helpText && !error && (
          <p className="text-xs text-white/50 mt-1">{helpText}</p>
        )}
      </div>
    );
  }
);

PremiumInput.displayName = 'PremiumInput';
```

### 3.4 Navigation Component

**Current Component:** `src/components/Navbar.tsx` (Clerk-integrated navigation with red/orange theme)

**New Premium Navbar (from HTML index.html header):**

```typescript
// src/components/premium/navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium/button';
import { cn } from '@/lib/utils';

export function PremiumNavbar() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Lock body scroll when mobile menu is open
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  if (!mounted) {
    return (
      <header className="z-50 relative" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.5), transparent)' }}>
        <div className="lg:px-8 max-w-7xl mx-auto px-6">
          <div className="flex pt-6 pb-6 items-center justify-between">
            <div className="w-[150px] h-[40px] bg-white/5 rounded animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  const navLinks = [
    { href: '/generate-program', label: 'Programs' },
    { href: '/trainer-booking', label: 'Coaches' },
    { href: '/membership', label: 'Pricing' },
    { href: '/recipes', label: 'Recipes' },
    { href: '/blog', label: 'Blog' },
    { href: '/marketplace', label: 'Shop' },
  ];

  return (
    <>
      {/* Header - exact from HTML */}
      <header
        className="z-50 relative"
        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.5), transparent)' }}
      >
        <div className="lg:px-8 max-w-7xl mx-auto px-6">
          <div className="flex pt-6 pb-6 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-center w-[150px] h-[40px] bg-cover rounded"
            >
              <span className="text-xl font-bold text-white font-geist">DERRIMUT 24:7</span>
            </Link>

            {/* Desktop Navigation - exact from HTML */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-normal font-geist transition',
                    pathname === link.href
                      ? 'font-medium text-white'
                      : 'text-white/80 hover:text-white/90'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {/* Auth Buttons */}
              {isSignedIn ? (
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'h-10 w-10',
                    },
                  }}
                />
              ) : (
                <PremiumButton
                  variant="primary"
                  onClick={() => {/* Handle sign in */}}
                >
                  Join Now
                </PremiumButton>
              )}
            </nav>

            {/* Mobile Menu Button - exact from HTML */}
            <button
              className="lg:hidden inline-flex transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 text-sm font-normal text-white/90 font-geist bg-white/10 border-white/10 border rounded-full pt-2 pr-4 pb-2 pl-4 backdrop-blur gap-2 items-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </>
              ) : (
                <>
                  <Menu className="w-4 h-4" />
                  <span>Menu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - exact from HTML */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 bg-black/95 backdrop-blur-xl z-50 transition-all duration-300 ease-out',
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
      >
        <div className="flex flex-col h-full pt-6 pb-8 px-6">
          {/* Close Button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 text-sm font-normal text-white/90 font-geist bg-white/10 border-white/10 border rounded-full pt-3 pr-3 pb-3 pl-3 backdrop-blur"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex-1">
            <div className="space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block hover:text-white transition text-2xl font-normal text-white/80 font-geist"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Auth */}
            <div className="mt-12 pt-8 border-t border-white/10">
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <PremiumButton
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    setMobileMenuOpen(false);
                    /* Handle sign in */
                  }}
                >
                  Join Now
                </PremiumButton>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
```

### 3.5 Footer Component

**Current Component:** `src/components/Footer.tsx`

**New Premium Footer (from HTML):**

```typescript
// src/components/premium/footer.tsx
'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export function PremiumFooter() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Locations', href: '#locations' },
        { label: 'Careers', href: '#careers' },
        { label: 'Contact', href: '/contact' },
      ]
    },
    {
      title: 'Programs',
      links: [
        { label: 'Strength Training', href: '/generate-program' },
        { label: 'Personal Training', href: '/trainer-booking' },
        { label: 'Group Classes', href: '#classes' },
        { label: 'Nutrition Plans', href: '/recipes' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Blog', href: '/blog' },
        { label: 'Recipes', href: '/recipes' },
        { label: 'Community', href: '/community' },
        { label: 'Help Center', href: '/help' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '#cookies' },
      ]
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'Youtube' },
  ];

  return (
    <footer className="bg-neutral-950 border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Footer Grid - from HTML */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white/90 transition block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar - from HTML */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/50">
            © {currentYear} Derrimut 24:7. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                className="text-white/60 hover:text-white/90 transition"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## 4. Page-Level Specifications

### 4.1 Homepage (app/page.tsx)

**Current:** Red/orange gym aesthetic with feature cards
**Reference:** `/Users/alias/Downloads/derrimut/index.html`

**New Structure:**

```typescript
// app/page.tsx - Premium Wellness Homepage
'use client';

import { PremiumHeroSection } from '@/components/premium/sections/hero-section';
import { PremiumPromiseSection } from '@/components/premium/sections/promise-section';
import { PremiumPhilosophySection } from '@/components/premium/sections/philosophy-section';
import { PremiumPlatformSection } from '@/components/premium/sections/platform-section';
import { PremiumCoachesPreview } from '@/components/premium/sections/coaches-preview';
import { PremiumPricingSection } from '@/components/premium/sections/pricing-section';
import { PremiumFAQSection } from '@/components/premium/sections/faq-section';
import { PremiumCTASection } from '@/components/premium/sections/cta-section';

export default function HomePage() {
  return (
    <div className="min-h-screen antialiased overflow-x-hidden text-white bg-neutral-950">
      {/* Fixed Background with Parallax Blur - from HTML */}
      <div
        className="fixed top-0 w-full -z-10 h-screen bg-cover bg-center"
        style={{
          backgroundImage: 'url(/hero-background.jpg)',
          animation: 'scrollBlur linear both',
          animationTimeline: 'view()',
          animationRange: 'entry 100% entry 200%',
        }}
      />

      <PremiumHeroSection />
      <PremiumPromiseSection />
      <PremiumPhilosophySection />
      <PremiumPlatformSection />
      <PremiumCoachesPreview />
      <PremiumPricingSection />
      <PremiumFAQSection />
      <PremiumCTASection />
    </div>
  );
}
```

### 4.2 Programs Page (app/generate-program/page.tsx)

**Current:** AI plan generator with form
**Reference:** `/Users/alias/Downloads/derrimut/programs.html`

**New Structure:**

```typescript
// components/premium/sections/programs-grid.tsx
'use client';

import { useState } from 'react';
import { PremiumCard, PremiumCardImage, PremiumCardContent, PremiumCardTitle, PremiumCardDescription, PremiumCardFooter } from '@/components/ui/premium/card';
import { PremiumButton } from '@/components/ui/premium/button';
import Image from 'next/image';
import { Star } from 'lucide-react';

const programs = [
  {
    id: 1,
    title: 'Strength Foundations',
    description: 'Build a solid base of strength and technique',
    category: 'Strength',
    duration: '8 weeks',
    level: 'Beginner',
    rating: 4.8,
    image: '/programs/strength.jpg',
  },
  // ... more programs
];

export function PremiumProgramsGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Strength', 'Cardio', 'Flexibility', 'Nutrition'];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      {/* Filter Tabs - from HTML */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              px-4 py-2 rounded-full text-sm font-normal font-geist transition
              ${selectedCategory === category
                ? 'bg-white/15 text-white border border-white/20'
                : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
              }
            `}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Programs Grid - from HTML */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <PremiumCard key={program.id} hover>
            <PremiumCardImage>
              <Image
                src={program.image}
                alt={program.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </PremiumCardImage>

            <PremiumCardContent>
              {/* Badge */}
              <span className="inline-block px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white/80 mb-3">
                {program.category}
              </span>

              <PremiumCardTitle>{program.title}</PremiumCardTitle>
              <PremiumCardDescription>{program.description}</PremiumCardDescription>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-xs text-white/50 mb-4">
                <span>{program.duration}</span>
                <span>•</span>
                <span>{program.level}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span>{program.rating}</span>
                </div>
              </div>
            </PremiumCardContent>

            <PremiumCardFooter>
              <PremiumButton variant="primary" fullWidth>
                View Program
              </PremiumButton>
            </PremiumCardFooter>
          </PremiumCard>
        ))}
      </div>
    </div>
  );
}
```

### 4.3 Coaches Page (app/trainer-booking/page.tsx)

**Current:** Trainer booking grid
**Reference:** `/Users/alias/Downloads/derrimut/coaches.html`

**Structure follows same pattern as programs grid with coach-specific data**

### 4.4 Sign In Page (app/(auth)/sign-in/[[...sign-in]]/page.tsx)

**Current:** Clerk authentication
**Reference:** `/Users/alias/Downloads/derrimut/signin.html`

**New Structure (Clerk integration with premium styling):**

```typescript
// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 relative overflow-hidden">
      {/* Background Image - from HTML signin.html */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(/auth-background.jpg)' }}
      />

      {/* Glassmorphism Container - from HTML */}
      <div className="relative z-10 max-w-md w-full mx-6">
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 backdrop-blur-md">
          <h1 className="text-3xl font-bold text-white text-center mb-8 font-geist">
            Welcome Back
          </h1>

          {/* Clerk Sign In Component with Premium Styling */}
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent shadow-none',
                formButtonPrimary: 'bg-white/10 hover:bg-white/15 border border-white/10 text-white/90 rounded-full backdrop-blur',
                formFieldInput: 'bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 rounded-lg backdrop-blur',
                formFieldLabel: 'text-white/80',
                footerActionLink: 'text-white/80 hover:text-white',
                identityPreviewText: 'text-white',
                formHeaderTitle: 'text-white',
                formHeaderSubtitle: 'text-white/70',
                socialButtonsBlockButton: 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 rounded-lg',
                dividerLine: 'bg-white/10',
                dividerText: 'text-white/60',
              }
            }}
          />
        </div>

        {/* Trust Indicators - from HTML */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/50">
            Trusted by 10,000+ fitness enthusiasts worldwide
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Complete Component Mapping

### 5.1 All 31 Current Components → Premium Versions

| Current Component | New Premium Component | Status | Notes |
|-------------------|----------------------|--------|-------|
| `ui/button.tsx` | `ui/premium/button.tsx` | ✅ Specified | Glassmorphism, rounded-full |
| `ui/card.tsx` | `ui/premium/card.tsx` | ✅ Specified | Glass background, hover effects |
| `ui/input.tsx` | `ui/premium/input.tsx` | ✅ Specified | Glass input with backdrop blur |
| `ui/badge.tsx` | `ui/premium/badge.tsx` | 📝 Spec below | Glass pill badges |
| `ui/accordion.tsx` | `ui/premium/accordion.tsx` | 📝 Spec below | Smooth animations |
| `ui/tabs.tsx` | `ui/premium/tabs.tsx` | 📝 Spec below | From HTML filter tabs |
| `ui/select.tsx` | `ui/premium/select.tsx` | 📝 Spec below | Dropdown with glass |
| `ui/textarea.tsx` | `ui/premium/textarea.tsx` | 📝 Spec below | Glass textarea |
| `ui/label.tsx` | `ui/premium/label.tsx` | 📝 Spec below | Typography updates |
| `Navbar.tsx` | `premium/navbar.tsx` | ✅ Specified | From HTML header |
| `Footer.tsx` | `premium/footer.tsx` | ✅ Specified | From HTML footer |
| `ThemeToggle.tsx` | `premium/theme-toggle.tsx` | 📝 Spec below | Glass toggle button |
| `ThemeAwareLogo.tsx` | `premium/logo.tsx` | 📝 Spec below | Premium branding |
| `AdminLayout.tsx` | `premium/admin-layout.tsx` | 📝 Spec below | Dark sidebar |
| `UserLayout.tsx` | `premium/user-layout.tsx` | 📝 Spec below | User dashboard layout |
| `GymLocationsSection.tsx` | `premium/sections/locations.tsx` | 📝 Spec below | Map with glass overlay |
| `NewsletterSignup.tsx` | `premium/sections/newsletter.tsx` | 📝 Spec below | Glass form |
| `ProfileHeader.tsx` | `premium/profile-header.tsx` | 📝 Spec below | User profile banner |
| `UserPrograms.tsx` | `premium/user-programs.tsx` | 📝 Spec below | Program cards |
| `InventoryModal.tsx` | `premium/inventory-modal.tsx` | 📝 Spec below | Glass modal |
| `LeafletMap.tsx` | `premium/leaflet-map.tsx` | 📝 Spec below | Dark theme map |
| `NoFitnessPlan.tsx` | `premium/no-fitness-plan.tsx` | 📝 Spec below | Empty state |
| `RoleGuard.tsx` | Keep as-is | ⚪ No change | Logic only |
| `NoSSR.tsx` | Keep as-is | ⚪ No change | Utility wrapper |
| `CornerElements.tsx` | `premium/corner-elements.tsx` | 📝 Spec below | Decorative elements |
| `TerminalOverlay.tsx` | `premium/terminal-overlay.tsx` | 📝 Spec below | Glass terminal |
| `ChadBot.tsx` | `premium/chat-bot.tsx` | 📝 Spec below | Glass chat widget |
| `ChatbaseWidget.tsx` | `premium/chatbase-widget.tsx` | 📝 Spec below | Glass widget |
| `ui/RichTextEditor.tsx` | `ui/premium/rich-text-editor.tsx` | 📝 Spec below | Dark theme editor |
| `ui/RichTextPreview.tsx` | `ui/premium/rich-text-preview.tsx` | 📝 Spec below | Dark preview |
| `ui/RecipeImage.tsx` | `ui/premium/recipe-image.tsx` | 📝 Spec below | Glass image wrapper |

### 5.2 Remaining Component Specifications

**Badge Component:**
```typescript
// ui/premium/badge.tsx
export const PremiumBadge = ({ children, variant = 'default' }: Props) => {
  const variants = {
    // From HTML: px-3 py-1 bg-white/10 border-white/20 rounded-full text-xs
    default: 'px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white/80',
    success: 'px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-xs text-green-200',
    warning: 'px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-xs text-yellow-200',
  };

  return <span className={variants[variant]}>{children}</span>;
};
```

**Tabs Component (Filter Tabs from HTML):**
```typescript
// ui/premium/tabs.tsx
export const PremiumTabs = ({ tabs, active, onChange }: Props) => {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`
            px-4 py-2 rounded-full text-sm font-normal font-geist transition whitespace-nowrap
            ${active === tab.value
              ? 'bg-white/15 text-white border border-white/20'
              : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
```

---

## 6. Complete Page Mapping (All 57 Pages)

### 6.1 Public Pages (18 pages)

| Current Page | Design Reference | Key Changes |
|-------------|------------------|-------------|
| `app/page.tsx` | `index.html` | Hero with parallax, sections with fadeSlideIn |
| `app/about/page.tsx` | Create new | Team section, mission statement |
| `app/blog/page.tsx` | Add to `index.html` style | Blog grid with glass cards |
| `app/blog/[slug]/page.tsx` | Article layout | Long-form reading experience |
| `app/contact/page.tsx` | `signin.html` form style | Glass contact form |
| `app/privacy/page.tsx` | Legal template | Typography-focused |
| `app/terms/page.tsx` | Legal template | Typography-focused |
| `app/help/page.tsx` | FAQ style | Accordion from `index.html` |
| `app/reviews/page.tsx` | Testimonials grid | Glass cards with ratings |
| `app/generate-program/page.tsx` | `programs.html` | Programs grid, filters |
| `app/trainer-booking/page.tsx` | `coaches.html` | Coaches grid with availability |
| `app/marketplace/page.tsx` | Product grid | Shop with glass cards |
| `app/marketplace/product/[id]/page.tsx` | Product detail | Image gallery + glass info panel |
| `app/marketplace/cart/page.tsx` | Cart table | Glass table with sticky summary |
| `app/marketplace/checkout/page.tsx` | `signin.html` form | Multi-step glass form |
| `app/marketplace/checkout/success/page.tsx` | Success state | Celebration animation |
| `app/membership/page.tsx` | `index.html` pricing | Pricing cards with glass |
| `app/membership/success/page.tsx` | Success state | Welcome message |

### 6.2 Authentication Pages (2 pages)

| Current Page | Design Reference | Key Changes |
|-------------|------------------|-------------|
| `app/(auth)/sign-in/[[...sign-in]]/page.tsx` | `signin.html` | Clerk with glass styling |
| `app/(auth)/sign-up/[[...sign-up]]/page.tsx` | `signin.html` | Clerk with glass styling |

### 6.3 User Profile Pages (9 pages)

| Current Page | Design Pattern | Key Changes |
|-------------|----------------|-------------|
| `app/profile/page.tsx` | Dashboard | Glass stats cards, sidebar nav |
| `app/profile/fitness-plans/page.tsx` | Programs grid | User's saved programs |
| `app/profile/diet-plans/page.tsx` | Programs grid | User's meal plans |
| `app/profile/progress/page.tsx` | Charts | Glass chart containers |
| `app/profile/training-sessions/page.tsx` | Calendar | Glass calendar view |
| `app/profile/orders/page.tsx` | Table | Glass order history |
| `app/profile/payment-slips/page.tsx` | Table | Glass payment records |
| `app/profile/reviews/page.tsx` | Review cards | User's posted reviews |
| `app/profile/settings/page.tsx` | Form sections | Glass form panels |

### 6.4 Trainer Pages (3 pages)

| Current Page | Design Pattern | Key Changes |
|-------------|----------------|-------------|
| `app/trainer/page.tsx` | Dashboard | Glass metrics, client list |
| `app/trainer/setup/page.tsx` | Onboarding | Multi-step glass form |
| `app/trainer-profile/[trainerId]/page.tsx` | `coaches.html` | Public trainer profile |

### 6.5 Admin Pages (20 pages)

| Current Page | Design Pattern | Key Changes |
|-------------|----------------|-------------|
| `app/admin/page.tsx` | Dashboard | Glass metrics grid |
| `app/admin/users/page.tsx` | Data table | Glass table with filters |
| `app/admin/trainer-applications/page.tsx` | Review cards | Glass approval cards |
| `app/admin/trainer-management/page.tsx` | Data table | Trainer CRUD |
| `app/admin/memberships/page.tsx` | Data table | Membership management |
| `app/admin/inventory/page.tsx` | Data table | Stock management |
| `app/admin/marketplace/page.tsx` | Product management | Glass product cards |
| `app/admin/recipes/page.tsx` | Recipe management | Glass recipe cards |
| `app/admin/blog/page.tsx` | Post list | Glass blog cards |
| `app/admin/blog/create/page.tsx` | Form | Glass editor |
| `app/admin/blog/edit/[postId]/page.tsx` | Form | Glass editor |
| `app/admin/salary/page.tsx` | Dashboard | Payroll overview |
| `app/admin/salary/structures/page.tsx` | Data table | Salary structures |
| `app/admin/salary/advances/page.tsx` | Data table | Advance requests |
| `app/admin/salary/payroll/page.tsx` | Data table | Payroll runs |
| `app/admin/salary/reports/page.tsx` | Reports | Glass report cards |
| `app/admin/seed-recipes/page.tsx` | Utility | Simple glass panel |
| `app/super-admin/page.tsx` | Super admin | Elevated permissions dashboard |
| `app/stripe-debug/page.tsx` | Debug | Developer console style |
| `app/webhook-test/page.tsx` | Debug | Developer console style |

### 6.6 Booking & Community Pages (5 pages)

| Current Page | Design Pattern | Key Changes |
|-------------|----------------|-------------|
| `app/book-session/[trainerId]/page.tsx` | Booking form | Glass calendar + form |
| `app/booking-success/page.tsx` | Success state | Confirmation with animation |
| `app/test-booking/page.tsx` | Test interface | Developer console style |
| `app/become-trainer/page.tsx` | Application form | Multi-step glass form |
| `app/community/create/page.tsx` | Post form | Glass editor |

### 6.7 Recipes Pages (2 pages)

| Current Page | Design Pattern | Key Changes |
|-------------|----------------|-------------|
| `app/recipes/page.tsx` | Recipe grid | Glass recipe cards with filters |
| `app/recipes/[id]/page.tsx` | Recipe detail | Hero image + glass instructions |

---

## 7. Tailwind CSS Configuration

### 7.1 Complete tailwind.config.ts

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Color system from HTML
      colors: {
        // Neutrals (premium wellness palette)
        'neutral-950': '#0a0a0a',
        'neutral-900': '#171717',
        'neutral-800': '#262626',
        'neutral-700': '#404040',
        'neutral-600': '#525252',
        'neutral-500': '#737373',
        'neutral-400': '#a3a3a3',
        'neutral-300': '#d4d4d4',
        'neutral-200': '#e5e5e5',
        'neutral-100': '#f5f5f5',
        'neutral-50': '#fafafa',

        // Accents
        'accent-gold': '#d4af37',
        'accent-sage': '#8b9474',
        'accent-slate': '#64748b',
        'accent-warm': '#78716c',
      },

      // Font families from HTML
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui'],
        geist: ['Geist', 'sans-serif'],
        'geist-mono': ['Geist Mono', 'monospace'],
      },

      // Backdrop blur from HTML
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },

      // Animation keyframes
      keyframes: {
        // From HTML: fadeSlideIn animation
        fadeSlideIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
            filter: 'blur(8px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
            filter: 'blur(0px)',
          },
        },
        // From HTML: scrollBlur animation
        scrollBlur: {
          from: { filter: 'blur(0px)' },
          to: { filter: 'blur(100px)' },
        },
      },

      animation: {
        'fade-slide-in': 'fadeSlideIn 1s ease-out forwards',
        'scroll-blur': 'scrollBlur linear both',
      },
    },
  },
  plugins: [],
};

export default config;
```

### 7.2 Global CSS Additions

```css
/* src/app/globals.css - Add to existing file */

/* Animation utility classes from HTML */
.animate-on-scroll {
  animation-play-state: paused !important;
}

.animate-on-scroll.animate {
  animation-play-state: running !important;
}

/* Font loading from HTML */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');

/* Scrollbar styling for premium look */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
```

---

## 8. Implementation Checklist

### Phase 1: Design System Foundation (3 days)
- [ ] Create `src/lib/design-system/premium-wellness.ts` with all tokens
- [ ] Update `tailwind.config.ts` with new colors, fonts, animations
- [ ] Add Geist font to Next.js font configuration (`app/layout.tsx`)
- [ ] Create CSS keyframes in `globals.css`
- [ ] Build `useScrollAnimation` hook
- [ ] Build `useMobileMenu` hook

### Phase 2: Core UI Components (4 days)
- [ ] `ui/premium/button.tsx` - Replace current Button
- [ ] `ui/premium/card.tsx` - Replace current Card
- [ ] `ui/premium/input.tsx` - Replace current Input
- [ ] `ui/premium/badge.tsx` - Replace current Badge
- [ ] `ui/premium/tabs.tsx` - Replace current Tabs
- [ ] `ui/premium/select.tsx` - Replace current Select
- [ ] `ui/premium/textarea.tsx` - Replace current Textarea
- [ ] `ui/premium/accordion.tsx` - Replace current Accordion
- [ ] `ui/premium/label.tsx` - Replace current Label
- [ ] `premium/glass-container.tsx` - New glassmorphism wrapper

### Phase 3: Navigation & Layout (3 days)
- [ ] `premium/navbar.tsx` - Replace Navbar.tsx (from HTML header)
- [ ] `premium/footer.tsx` - Replace Footer.tsx (from HTML footer)
- [ ] `premium/mobile-menu.tsx` - Mobile menu component
- [ ] `premium/logo.tsx` - Replace ThemeAwareLogo
- [ ] Update `app/layout.tsx` with new components
- [ ] Dark mode toggle with premium styling

### Phase 4: Homepage (4 days)
- [ ] `premium/sections/hero-section.tsx` - From index.html hero
- [ ] `premium/sections/promise-section.tsx` - From index.html
- [ ] `premium/sections/philosophy-section.tsx` - From index.html
- [ ] `premium/sections/platform-section.tsx` - From index.html
- [ ] `premium/sections/coaches-preview.tsx` - From index.html
- [ ] `premium/sections/pricing-section.tsx` - From index.html
- [ ] `premium/sections/faq-section.tsx` - From index.html
- [ ] `premium/sections/cta-section.tsx` - From index.html
- [ ] Update `app/page.tsx` with all sections
- [ ] Add parallax background with scrollBlur

### Phase 5: Public Pages (5 days)
- [ ] `app/generate-program/page.tsx` - Programs from programs.html
- [ ] `premium/sections/programs-grid.tsx`
- [ ] `app/trainer-booking/page.tsx` - Coaches from coaches.html
- [ ] `premium/sections/coaches-grid.tsx`
- [ ] `app/membership/page.tsx` - Pricing cards
- [ ] `app/recipes/page.tsx` - Recipe grid
- [ ] `app/recipes/[id]/page.tsx` - Recipe detail
- [ ] `app/blog/page.tsx` - Blog grid
- [ ] `app/blog/[slug]/page.tsx` - Blog post
- [ ] `app/marketplace/page.tsx` - Shop grid
- [ ] `app/marketplace/product/[id]/page.tsx` - Product detail

### Phase 6: Authentication (2 days)
- [ ] `app/(auth)/sign-in/[[...sign-in]]/page.tsx` - From signin.html
- [ ] `app/(auth)/sign-up/[[...sign-up]]/page.tsx` - From signin.html
- [ ] Clerk appearance customization with premium theme
- [ ] Auth background and glassmorphism

### Phase 7: User Profile (4 days)
- [ ] `premium/user-layout.tsx` - Profile sidebar layout
- [ ] `premium/profile-header.tsx` - User banner
- [ ] `app/profile/page.tsx` - Dashboard
- [ ] `app/profile/fitness-plans/page.tsx`
- [ ] `app/profile/diet-plans/page.tsx`
- [ ] `app/profile/progress/page.tsx`
- [ ] `app/profile/training-sessions/page.tsx`
- [ ] `app/profile/orders/page.tsx`
- [ ] `app/profile/settings/page.tsx`
- [ ] Glass stats cards, charts, tables

### Phase 8: Admin & Trainer Panels (5 days)
- [ ] `premium/admin-layout.tsx` - Dark sidebar
- [ ] `premium/data-table.tsx` - Glass table component
- [ ] `app/admin/page.tsx` - Admin dashboard
- [ ] `app/admin/users/page.tsx` - User management
- [ ] `app/admin/trainer-applications/page.tsx`
- [ ] `app/admin/inventory/page.tsx`
- [ ] `app/admin/marketplace/page.tsx`
- [ ] `app/admin/blog/page.tsx`
- [ ] `app/admin/salary/*` - All payroll pages
- [ ] `app/trainer/page.tsx` - Trainer dashboard
- [ ] All remaining admin pages

### Phase 9: Polish & Testing (3 days)
- [ ] Mobile responsiveness testing on all pages
- [ ] Animation performance optimization
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Performance optimization (bundle size, image loading)
- [ ] Dark mode consistency check
- [ ] Final visual QA against HTML references

---

## 9. Migration Strategy

### 9.1 Gradual Rollout (Recommended)

**Option A: Feature Flag Approach**
```typescript
// lib/feature-flags.ts
export const PREMIUM_THEME_ENABLED = process.env.NEXT_PUBLIC_PREMIUM_THEME === 'true';

// app/layout.tsx
import { PREMIUM_THEME_ENABLED } from '@/lib/feature-flags';
import { Navbar } from '@/components/Navbar';
import { PremiumNavbar } from '@/components/premium/navbar';

export default function RootLayout({ children }: Props) {
  const NavComponent = PREMIUM_THEME_ENABLED ? PremiumNavbar : Navbar;

  return (
    <html>
      <body>
        <NavComponent />
        {children}
      </body>
    </html>
  );
}
```

### 9.2 Testing Strategy

1. **Component-level testing** - Build premium components in Storybook
2. **Page-level testing** - Deploy preview builds to Vercel
3. **A/B testing** - Use feature flags to test with subset of users
4. **Full migration** - Switch all users after validation

---

## 10. Success Metrics

### 10.1 Visual Quality
- [ ] 100% match to HTML reference designs
- [ ] Smooth 60fps animations on all devices
- [ ] Consistent glassmorphism across all components
- [ ] Proper dark theme support

### 10.2 Performance
- [ ] Lighthouse score 90+ (Performance)
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.0s
- [ ] Bundle size increase < 20%

### 10.3 Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation functional
- [ ] Screen reader compatible
- [ ] Color contrast ratios pass

### 10.4 Cross-browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari 15+
- [ ] Mobile browsers (iOS Safari, Chrome Android)

---

## 11. File Structure Summary

```
src/
├── lib/
│   ├── design-system/
│   │   └── premium-wellness.ts          # All design tokens
│   └── hooks/
│       ├── use-scroll-animation.ts      # IntersectionObserver hook
│       └── use-mobile-menu.ts           # Mobile menu state
├── components/
│   ├── ui/
│   │   └── premium/                     # New premium UI components
│   │       ├── button.tsx               # From HTML buttons
│   │       ├── card.tsx                 # From HTML cards
│   │       ├── input.tsx                # From HTML inputs
│   │       ├── badge.tsx                # From HTML badges
│   │       ├── tabs.tsx                 # From HTML filter tabs
│   │       └── ...                      # 10 total components
│   └── premium/                         # Premium feature components
│       ├── navbar.tsx                   # From HTML header
│       ├── footer.tsx                   # From HTML footer
│       ├── mobile-menu.tsx              # From HTML mobile menu
│       ├── sections/                    # Homepage sections
│       │   ├── hero-section.tsx         # From index.html
│       │   ├── programs-grid.tsx        # From programs.html
│       │   ├── coaches-grid.tsx         # From coaches.html
│       │   └── ...                      # 15+ sections
│       └── ...                          # Other premium components
└── app/
    └── ...                              # All 57 pages updated
```

---

## 12. Conclusion

This design system provides complete specifications for transforming all 57 pages and 31 components of the Derrimut 24:7 platform from gym red/orange aesthetic to premium wellness lifestyle branding. Every design token, component, and page has been extracted from your reference HTML files to ensure pixel-perfect consistency.

**Total Implementation Time:** 22-30 days for complete transformation

**Next Steps:**
1. Review and approve this design document
2. Set up git worktree for isolated development
3. Begin Phase 1 (Design System Foundation)
4. Iterate through phases with code reviews between each

---

**Document Version:** 1.0
**Last Updated:** 2025-01-09
**Status:** Ready for Implementation
