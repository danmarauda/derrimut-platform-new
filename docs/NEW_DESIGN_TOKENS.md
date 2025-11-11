# 🎨 NEW DESIGN TOKENS SPECIFICATION
## Complete Design Token System for Premium Dark Theme

**Date:** 2025-01-27  
**Status:** Specification Complete  
**Version:** 2.0.0  
**Theme:** Dark-Only Premium

---

## 📋 EXECUTIVE SUMMARY

This document defines the complete design token system for the migrated premium dark theme. All tokens are optimized for dark-first design with advanced glassmorphism effects.

### Design Principles
1. **Dark-First:** All tokens optimized for `bg-neutral-950` background
2. **Glassmorphism:** Extensive use of white opacity overlays
3. **No Brand Colors:** Pure neutral palette with emerald accents
4. **Consistency:** Unified token system across all components
5. **Performance:** Optimized for rendering and animations

---

## 🎨 COLOR TOKENS

### Background Colors

```css
/* Base Background */
--background: #0a0a0a;                    /* neutral-950 - Primary background */

/* Glassmorphic Surfaces */
--surface-base: rgba(255, 255, 255, 0.05);      /* bg-white/5 - Cards, containers */
--surface-elevated: rgba(255, 255, 255, 0.10);  /* bg-white/10 - Buttons, hover */
--surface-active: rgba(255, 255, 255, 0.15);    /* bg-white/15 - Active states */
--surface-subtle: rgba(255, 255, 255, 0.07);    /* bg-white/[0.07] - Subtle hover */

/* Overlays */
--overlay-menu: rgba(0, 0, 0, 0.95);            /* bg-black/95 - Mobile menu */
--overlay-image: rgba(0, 0, 0, 0.40);            /* bg-black/40 - Image overlays */
```

**Tailwind Classes:**
```css
bg-neutral-950        /* Primary background */
bg-white/5            /* Base surface */
bg-white/10           /* Elevated surface */
bg-white/15           /* Active surface */
bg-white/[0.07]       /* Subtle surface */
bg-black/95           /* Menu overlay */
bg-black/40           /* Image overlay */
```

### Text Colors

```css
/* Text Hierarchy */
--text-primary: #ffffff;                        /* text-white - Headings */
--text-secondary: rgba(255, 255, 255, 0.90);    /* text-white/90 - Secondary headings */
--text-tertiary: rgba(255, 255, 255, 0.80);     /* text-white/80 - Links, navigation */
--text-body: rgba(255, 255, 255, 0.70);         /* text-white/70 - Body text */
--text-muted: rgba(255, 255, 255, 0.60);        /* text-white/60 - Muted text (MOST COMMON) */
--text-subtle: rgba(255, 255, 255, 0.50);       /* text-white/50 - Subtle text */
--text-placeholder: rgba(255, 255, 255, 0.40);  /* text-white/40 - Placeholders */
```

**Tailwind Classes:**
```css
text-white            /* Primary text */
text-white/90         /* Secondary text */
text-white/80         /* Tertiary text */
text-white/70         /* Body text */
text-white/60         /* Muted text */
text-white/50         /* Subtle text */
text-white/40         /* Placeholder text */
```

### Border Colors

```css
/* Border Hierarchy */
--border-base: rgba(255, 255, 255, 0.10);        /* border-white/10 - Default borders */
--border-elevated: rgba(255, 255, 255, 0.15);    /* border-white/15 - Elevated borders */
--border-active: rgba(255, 255, 255, 0.20);      /* border-white/20 - Active borders */
--border-accent: rgba(52, 211, 153, 0.30);        /* border-emerald-400/30 - Accent borders */
```

**Tailwind Classes:**
```css
border-white/10       /* Default border */
border-white/15       /* Elevated border */
border-white/20       /* Active border */
border-emerald-400/30 /* Accent border */
```

### Accent Colors

```css
/* Success/Positive States */
--accent-emerald-bg: rgba(16, 185, 129, 0.10);   /* bg-emerald-500/10 */
--accent-emerald-text: #34d399;                  /* text-emerald-400 */
--accent-emerald-border: rgba(52, 211, 153, 0.30); /* border-emerald-400/30 */

/* Primary CTA Button */
--button-primary-bg: #f4f4f5;                    /* bg-zinc-100 */
--button-primary-text: #18181b;                  /* text-zinc-900 */
--button-primary-hover: #ffffff;                 /* hover:bg-white */
```

**Tailwind Classes:**
```css
bg-emerald-500/10     /* Emerald background */
text-emerald-400      /* Emerald text */
border-emerald-400/30 /* Emerald border */
bg-zinc-100           /* Primary button background */
text-zinc-900         /* Primary button text */
hover:bg-white        /* Primary button hover */
```

### Gradient Tokens

```css
/* Text Gradients */
--gradient-text: linear-gradient(180deg, #fff, rgba(255,255,255,0.65));

/* Border Gradients */
--gradient-border-horizontal: linear-gradient(to right, transparent, rgba(255,255,255,0.10), transparent);
--gradient-border-vertical: linear-gradient(to bottom, transparent, rgba(255,255,255,0.10), transparent);
--gradient-border-animated: linear-gradient(225deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.0) 100%);

/* Radial Gradients */
--gradient-radial-subtle: radial-gradient(600px 280px at 60% 40%, rgba(255,255,255,0.07), transparent 60%);
--gradient-radial-card: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%);
```

---

## 📝 TYPOGRAPHY TOKENS

### Font Families

```css
/* Primary Font - Body Text */
--font-body: 'Inter', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;

/* Secondary Font - Headings */
--font-heading: 'Geist', sans-serif;

/* Monospace Font */
--font-mono: 'Geist Mono', monospace;
```

**Tailwind Classes:**
```css
font-inter            /* Body text */
font-geist            /* Headings */
font-mono             /* Code/monospace */
```

### Font Sizes

```css
/* Display Sizes */
--text-display-3xl: 4.5rem;    /* 72px - text-7xl */
--text-display-2xl: 3.75rem;   /* 60px - text-6xl */
--text-display-xl: 3rem;       /* 48px - text-5xl */

/* Heading Sizes */
--text-heading-4xl: 2.25rem;   /* 36px - text-4xl */
--text-heading-3xl: 1.875rem;  /* 30px - text-3xl */
--text-heading-2xl: 1.5rem;     /* 24px - text-2xl */
--text-heading-xl: 1.25rem;     /* 20px - text-xl */

/* Body Sizes */
--text-body-lg: 1.125rem;       /* 18px - text-lg */
--text-body-base: 1rem;         /* 16px - text-base */
--text-body-sm: 0.875rem;       /* 14px - text-sm */
--text-body-xs: 0.75rem;        /* 12px - text-xs */
--text-body-tiny: 0.6875rem;    /* 11px - text-[11px] */
```

**Tailwind Classes:**
```css
text-7xl             /* Display 3xl */
text-6xl             /* Display 2xl */
text-5xl             /* Display xl */
text-4xl             /* Heading 4xl */
text-3xl             /* Heading 3xl */
text-2xl             /* Heading 2xl */
text-xl              /* Heading xl */
text-lg              /* Body large */
text-base            /* Body base */
text-sm              /* Body small */
text-xs              /* Body extra small */
text-[11px]          /* Body tiny */
```

### Font Weights

```css
--font-weight-light: 300;       /* font-light */
--font-weight-normal: 400;      /* font-normal */
--font-weight-medium: 500;       /* font-medium */
--font-weight-semibold: 600;    /* font-semibold */
--font-weight-bold: 700;         /* font-bold */
```

**Tailwind Classes:**
```css
font-light           /* 300 */
font-normal          /* 400 */
font-medium          /* 500 */
font-semibold        /* 600 */
font-bold            /* 700 */
```

### Letter Spacing

```css
--letter-spacing-tight: -0.025em;    /* tracking-tight */
--letter-spacing-normal: 0em;        /* tracking-normal */
--letter-spacing-wide: 0.05em;       /* tracking-wider */
--letter-spacing-widest: 0.1em;      /* tracking-widest */
```

**Tailwind Classes:**
```css
tracking-tight        /* Tight spacing */
tracking-normal       /* Normal spacing */
tracking-wider        /* Wide spacing */
tracking-widest       /* Widest spacing */
```

### Line Heights

```css
--line-height-none: 1;              /* leading-none */
--line-height-tight: 0.95;          /* leading-[0.95] */
--line-height-normal: 1.5;          /* leading-normal */
--line-height-relaxed: 1.625;       /* leading-relaxed */
```

**Tailwind Classes:**
```css
leading-none          /* 1 */
leading-[0.95]        /* 0.95 */
leading-normal        /* 1.5 */
leading-relaxed       /* 1.625 */
```

---

## 📐 SPACING TOKENS

### Padding Scale

```css
--spacing-padding-xs: 0.5rem;      /* 8px - p-2 */
--spacing-padding-sm: 0.75rem;    /* 12px - p-3 */
--spacing-padding-base: 1rem;     /* 16px - p-4 */
--spacing-padding-md: 1.25rem;     /* 20px - p-5 */
--spacing-padding-lg: 1.5rem;      /* 24px - p-6 */
--spacing-padding-xl: 2rem;        /* 32px - p-8 */
```

**Tailwind Classes:**
```css
p-2                  /* 8px */
p-3                  /* 12px */
p-4                  /* 16px */
p-5                  /* 20px */
p-6                  /* 24px */
p-8                  /* 32px */
```

### Gap Scale

```css
--spacing-gap-xs: 0.5rem;          /* 8px - gap-2 */
--spacing-gap-sm: 0.625rem;        /* 10px - gap-2.5 */
--spacing-gap-base: 0.75rem;       /* 12px - gap-3 */
--spacing-gap-md: 1rem;             /* 16px - gap-4 */
--spacing-gap-lg: 1.5rem;           /* 24px - gap-6 */
--spacing-gap-xl: 2rem;             /* 32px - gap-8 */
--spacing-gap-2xl: 2.5rem;          /* 40px - gap-10 */
--spacing-gap-3xl: 3rem;            /* 48px - gap-12 */
```

**Tailwind Classes:**
```css
gap-2                /* 8px */
gap-2.5              /* 10px */
gap-3                /* 12px */
gap-4                /* 16px */
gap-6                /* 24px */
gap-8                /* 32px */
gap-10               /* 40px */
gap-12               /* 48px */
```

### Margin Scale

```css
--spacing-margin-xs: 0.25rem;      /* 4px - mt-1 */
--spacing-margin-sm: 0.5rem;       /* 8px - mt-2 */
--spacing-margin-base: 0.75rem;    /* 12px - mt-3 */
--spacing-margin-md: 1rem;         /* 16px - mt-4 */
--spacing-margin-lg: 1.5rem;       /* 24px - mt-6 */
--spacing-margin-xl: 2rem;         /* 32px - mt-8 */
--spacing-margin-2xl: 2.5rem;      /* 40px - mt-10 */
--spacing-margin-3xl: 3rem;         /* 48px - mt-12 */
```

**Tailwind Classes:**
```css
mt-1, mb-1           /* 4px */
mt-2, mb-2            /* 8px */
mt-3, mb-3            /* 12px */
mt-4, mb-4            /* 16px */
mt-6, mb-6            /* 24px */
mt-8, mb-8            /* 32px */
mt-10, mb-10          /* 40px */
mt-12, mb-12          /* 48px */
```

---

## 🔲 BORDER RADIUS TOKENS

```css
--radius-sm: 0.25rem;        /* 4px - rounded */
--radius-md: 0.5rem;         /* 8px - rounded-lg */
--radius-lg: 0.75rem;        /* 12px - rounded-xl */
--radius-xl: 1rem;           /* 16px - rounded-2xl */
--radius-2xl: 1.5rem;        /* 24px - rounded-3xl */
--radius-full: 9999px;       /* 50% - rounded-full */
```

**Tailwind Classes:**
```css
rounded               /* 4px */
rounded-lg            /* 8px */
rounded-xl            /* 12px */
rounded-2xl           /* 16px */
rounded-3xl           /* 24px */
rounded-full          /* 50% */
```

**Base Radius Variable:**
```css
--radius: 0.625rem;   /* 10px - Base for calculations */
```

---

## ✨ EFFECT TOKENS

### Backdrop Blur

```css
--blur-sm: 4px;       /* backdrop-blur-sm */
--blur-md: 8px;       /* backdrop-blur-md */
--blur-lg: 16px;      /* backdrop-blur-xl */
--blur-xl: 24px;      /* backdrop-blur-2xl */
--blur-2xl: 40px;     /* backdrop-blur-3xl */
```

**Tailwind Classes:**
```css
backdrop-blur-sm      /* Small blur */
backdrop-blur-md      /* Medium blur */
backdrop-blur-xl      /* Large blur */
backdrop-blur-2xl     /* Extra large blur */
backdrop-blur-3xl     /* Ultra blur */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

**Tailwind Classes:**
```css
shadow-sm             /* Small shadow */
shadow-md             /* Medium shadow */
shadow-lg             /* Large shadow */
shadow-2xl            /* Extra large shadow */
```

### Transitions

```css
--transition-fast: 150ms;
--transition-base: 300ms;
--transition-slow: 500ms;
```

**Tailwind Classes:**
```css
transition            /* All properties */
transition-colors     /* Colors only */
transition-all        /* All + transform */
duration-300          /* 300ms duration */
```

---

## 🎬 ANIMATION TOKENS

### Keyframe Animations

```css
/* fadeSlideIn */
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

/* scrollBlur */
@keyframes scrollBlur {
  from { filter: blur(0px); }
  to { filter: blur(100px); }
}

/* fadeInSlideBlur */
@keyframes fadeInSlideBlur {
  from {
    opacity: 0;
    transform: translateX(-30px);
    filter: blur(8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
    filter: blur(0px);
  }
}
```

### Animation Durations

```css
--animation-fast: 0.3s;
--animation-base: 0.5s;
--animation-slow: 1.0s;
```

### Animation Delays

```css
--animation-delay-xs: 0.1s;
--animation-delay-sm: 0.2s;
--animation-delay-md: 0.3s;
--animation-delay-lg: 0.4s;
--animation-delay-xl: 0.5s;
```

---

## 🎯 COMPONENT-SPECIFIC TOKENS

### Button Tokens

```css
/* Primary Button (Light) */
--button-primary-bg: #f4f4f5;
--button-primary-text: #18181b;
--button-primary-hover: #ffffff;
--button-primary-radius: 1rem;        /* rounded-2xl */
--button-primary-padding-x: 1.25rem;  /* px-5 */
--button-primary-padding-y: 0.75rem;  /* py-3 */

/* Secondary Button (Glassmorphic) */
--button-secondary-bg: rgba(255, 255, 255, 0.10);
--button-secondary-text: #ffffff;
--button-secondary-hover: rgba(255, 255, 255, 0.15);
--button-secondary-radius: 1rem;      /* rounded-2xl */
--button-secondary-border: rgba(255, 255, 255, 0.10);

/* Tertiary Button (Simple) */
--button-tertiary-bg: rgba(255, 255, 255, 0.10);
--button-tertiary-text: rgba(255, 255, 255, 0.90);
--button-tertiary-hover: rgba(255, 255, 255, 0.15);
--button-tertiary-radius: 9999px;     /* rounded-full */
```

### Card Tokens

```css
--card-bg: rgba(255, 255, 255, 0.05);
--card-border: rgba(255, 255, 255, 0.10);
--card-radius: 1rem;                  /* rounded-2xl */
--card-padding: 1.5rem;                /* p-6 */
--card-backdrop-blur: 4px;             /* backdrop-blur-sm */
--card-hover-bg: rgba(255, 255, 255, 0.10);
```

### Badge Tokens

```css
--badge-bg: rgba(255, 255, 255, 0.05);
--badge-border: rgba(255, 255, 255, 0.10);
--badge-text: rgba(255, 255, 255, 0.70);
--badge-text-size: 0.6875rem;         /* text-[11px] */
--badge-padding-x: 0.75rem;           /* px-3 */
--badge-padding-y: 0.25rem;           /* py-1 */
--badge-radius: 9999px;               /* rounded-full */
```

### Input Tokens

```css
--input-bg: rgba(255, 255, 255, 0.05);
--input-border: rgba(255, 255, 255, 0.10);
--input-text: rgba(255, 255, 255, 0.90);
--input-placeholder: rgba(255, 255, 255, 0.40);
--input-radius: 0.75rem;               /* rounded-xl */
--input-padding-x: 1rem;               /* px-4 */
--input-padding-y: 0.75rem;            /* py-3 */
--input-focus-ring: rgba(255, 255, 255, 0.20);
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
--breakpoint-sm: 640px;    /* sm: */
--breakpoint-md: 768px;    /* md: */
--breakpoint-lg: 1024px;   /* lg: */
--breakpoint-xl: 1280px;   /* xl: */
--breakpoint-2xl: 1536px;  /* 2xl: */
```

**Tailwind Classes:**
```css
sm:                    /* 640px+ */
md:                    /* 768px+ */
lg:                    /* 1024px+ */
xl:                    /* 1280px+ */
2xl:                   /* 1536px+ */
```

---

## 🎨 CSS VARIABLES SUMMARY

### Complete Variable List

```css
:root {
  /* Colors */
  --background: #0a0a0a;
  --surface-base: rgba(255, 255, 255, 0.05);
  --surface-elevated: rgba(255, 255, 255, 0.10);
  --surface-active: rgba(255, 255, 255, 0.15);
  
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.90);
  --text-tertiary: rgba(255, 255, 255, 0.80);
  --text-body: rgba(255, 255, 255, 0.70);
  --text-muted: rgba(255, 255, 255, 0.60);
  --text-subtle: rgba(255, 255, 255, 0.50);
  --text-placeholder: rgba(255, 255, 255, 0.40);
  
  --border-base: rgba(255, 255, 255, 0.10);
  --border-elevated: rgba(255, 255, 255, 0.15);
  --border-active: rgba(255, 255, 255, 0.20);
  
  --accent-emerald-bg: rgba(16, 185, 129, 0.10);
  --accent-emerald-text: #34d399;
  --accent-emerald-border: rgba(52, 211, 153, 0.30);
  
  /* Typography */
  --font-body: 'Inter', ui-sans-serif, system-ui;
  --font-heading: 'Geist', sans-serif;
  --font-mono: 'Geist Mono', monospace;
  
  /* Spacing */
  --radius: 0.625rem;
  
  /* Effects */
  --blur-sm: 4px;
  --blur-md: 8px;
  --blur-lg: 16px;
  --blur-xl: 24px;
  --blur-2xl: 40px;
}
```

---

## 📚 USAGE GUIDELINES

### Color Usage
- **Backgrounds:** Always use `bg-neutral-950` as base
- **Surfaces:** Use `bg-white/5` to `/15` for glassmorphism
- **Text:** Use opacity hierarchy (`text-white/60` for body, `text-white` for headings)
- **Borders:** Always use white opacity (`border-white/10`)

### Typography Usage
- **Headings:** Use `font-geist` with `font-semibold` and `tracking-tight`
- **Body:** Use `font-inter` with `font-normal` and `leading-relaxed`
- **Sizes:** Use responsive sizing (`text-5xl md:text-6xl lg:text-7xl`)

### Spacing Usage
- **Components:** Use `p-4` or `p-6` for cards
- **Sections:** Use `py-16 md:py-24` for vertical spacing
- **Gaps:** Use `gap-4` or `gap-6` for grids

### Effects Usage
- **Glassmorphism:** Always combine `bg-white/X` with `backdrop-blur`
- **Borders:** Use `border-gradient` for premium elements
- **Animations:** Use `fadeSlideIn` with incremental delays

---

## 🔄 MIGRATION FROM OLD TOKENS

### Old → New Mapping

| Old Token | New Token | Action |
|-----------|-----------|--------|
| `--primary` | N/A | ❌ **REMOVE** |
| `--secondary` | N/A | ❌ **REMOVE** |
| `--background` | `bg-neutral-950` | ✅ **KEEP** |
| `--foreground` | `text-white` | ⚠️ **REPLACE** |
| `--card` | `bg-white/5` | ⚠️ **REPLACE** |
| `--border` | `border-white/10` | ⚠️ **REPLACE** |
| `--muted-foreground` | `text-white/60` | ⚠️ **REPLACE** |

---

**Design Tokens Specification Complete** ✅  
**Ready for Implementation** 🚀

