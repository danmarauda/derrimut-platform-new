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

PremiumCardImage.displayName = 'PremiumCardImage';

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

PremiumCardContent.displayName = 'PremiumCardContent';

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

PremiumCardTitle.displayName = 'PremiumCardTitle';

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

PremiumCardDescription.displayName = 'PremiumCardDescription';

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

PremiumCardFooter.displayName = 'PremiumCardFooter';
