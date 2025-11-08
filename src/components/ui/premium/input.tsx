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
