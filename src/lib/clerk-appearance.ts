/**
 * Clerk Appearance Configuration
 * Matches the premium dark-first glassmorphic design system
 */

import { dark } from '@clerk/themes';

export const clerkAppearance = {
  baseTheme: dark,
  elements: {
    // Root container
    rootBox: 'w-full',
    
    // Card container
    card: 'bg-transparent shadow-none border-none',
    
    // Header
    headerTitle: 'text-white text-2xl font-semibold tracking-tight',
    headerSubtitle: 'text-white/60 text-sm',
    
    // Form elements
    formButtonPrimary: 
      'bg-zinc-100 hover:bg-white text-zinc-900 rounded-2xl px-6 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 shadow-sm border-gradient before:rounded-2xl',
    formButtonReset: 
      'bg-white/10 hover:bg-white/15 border border-white/10 text-white/90 rounded-full px-4 py-2 text-sm font-medium transition-all backdrop-blur',
    
    // Input fields
    formFieldInput: 
      'bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 rounded-xl px-4 py-3 text-sm backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0',
    formFieldLabel: 
      'text-white/90 text-sm font-medium mb-2',
    formFieldErrorText: 
      'text-red-400 text-xs mt-1',
    formFieldSuccessText: 
      'text-emerald-400 text-xs mt-1',
    
    // Social buttons
    socialButtonsBlockButton: 
      'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm font-medium transition-all backdrop-blur',
    socialButtonsBlockButtonText: 
      'text-white/90',
    
    // Divider
    dividerLine: 'bg-white/10',
    dividerText: 'text-white/60 text-xs',
    
    // Footer links
    footerActionLink: 
      'text-white/80 hover:text-white transition-colors text-sm',
    footerActionText: 
      'text-white/60 text-sm',
    
    // Identity preview
    identityPreviewText: 
      'text-white/90',
    identityPreviewEditButton: 
      'text-white/80 hover:text-white',
    
    // Alert
    alertText: 
      'text-white/90 text-sm',
    alertIcon: 
      'text-white/60',
    
    // Form resend code link
    formResendCodeLink: 
      'text-white/80 hover:text-white transition-colors text-sm',
    
    // OTP input
    otpCodeFieldInput: 
      'bg-white/5 border border-white/10 text-white rounded-xl focus:bg-white/10 focus:border-white/20 backdrop-blur-sm',
    
    // Phone input
    phoneInputBox: 
      'bg-white/5 border border-white/10 rounded-xl',
    phoneInputInput: 
      'bg-transparent text-white placeholder:text-white/40',
    
    // Select
    selectButton: 
      'bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl',
    
    // Modal
    modalContent: 
      'bg-transparent',
    modalBackdrop: 
      'bg-black/80 backdrop-blur-sm',
    
    // Avatar
    avatarBox: 
      'border border-white/10',
    
    // Badge
    badge: 
      'bg-white/5 border border-white/10 text-white/70 rounded-full px-3 py-1 text-xs',
  },
  variables: {
    colorPrimary: '#ffffff',
    colorText: '#ffffff',
    colorTextSecondary: 'rgba(255, 255, 255, 0.6)',
    colorBackground: '#0a0a0a',
    colorInputBackground: 'rgba(255, 255, 255, 0.05)',
    colorInputText: '#ffffff',
    colorDanger: '#f87171',
    colorSuccess: '#34d399',
    borderRadius: '0.75rem', // rounded-xl
    fontFamily: 'var(--font-inter), system-ui, sans-serif',
    fontSize: '0.875rem', // text-sm
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
    },
  },
} as const;