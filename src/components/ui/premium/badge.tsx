'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const PremiumBadge = forwardRef<HTMLSpanElement, PremiumBadgeProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    const variants = {
      // From HTML: px-3 py-1 bg-white/10 border-white/20 rounded-full text-xs
      default: 'px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white/80',
      success: 'px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-xs text-green-200',
      warning: 'px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-xs text-yellow-200',
      error: 'px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-xs text-red-200',
    };

    return (
      <span
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

PremiumBadge.displayName = 'PremiumBadge';
