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
      primary: 'bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-normal text-white/90 rounded-full pt-2 pr-4 pb-2 pl-4 backdrop-blur',

      // From HTML: bg-transparent hover:bg-white/5 border-white/20
      ghost: 'bg-transparent hover:bg-white/5 border border-white/20 text-sm font-normal text-white/80 rounded-full pt-2 pr-4 pb-2 pl-4 backdrop-blur',

      // Outline variant
      outline: 'bg-transparent hover:bg-white/10 border border-white/10 text-sm font-normal text-white/90 rounded-full pt-2 pr-4 pb-2 pl-4 backdrop-blur',
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
