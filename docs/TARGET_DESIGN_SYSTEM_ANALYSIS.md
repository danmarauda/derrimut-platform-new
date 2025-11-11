# 🎯 TARGET DESIGN SYSTEM - FORENSIC ANALYSIS
## Derrimut Premium Dark Theme - Complete Specification

**Source:** `/Users/alias/Downloads/derrimut`  
**Date:** 2025-01-27  
**Status:** Complete Analysis - Ready for Migration  
**Type:** Static HTML Site (Reference Design System)  
**Total Pages:** 34 HTML files

---

## 📊 EXECUTIVE SUMMARY

### Design Philosophy
**Premium Wellness Lifestyle Brand** - Sophisticated minimalism with advanced glassmorphism effects, inspired by high-end fitness brands. Dark-first design with elegant typography, subtle animations, and premium user experience.

### Key Characteristics
- **Dark-First:** `bg-neutral-950` (#0a0a0a) as primary background
- **Glassmorphism:** Extensive use of `bg-white/5` to `/15` with backdrop blur
- **Advanced Effects:** FxFilter liquid glass effects (`[--fx-filter:blur(10px)_liquid-glass(...)]`)
- **Border Gradients:** Animated gradient borders via `.border-gradient` class
- **Scroll Animations:** IntersectionObserver-based fadeSlideIn animations
- **Typography Hierarchy:** Inter (body) + Geist (headings) with precise opacity levels
- **No Brand Colors:** Pure neutral palette - no red/orange gym branding

---

## 🎨 DESIGN TOKENS - COMPLETE SPECIFICATION

### 1. COLOR SYSTEM

#### 1.1 Background Colors
```css
/* Primary Background */
bg-neutral-950                    /* #0a0a0a - Main page background */

/* Glassmorphic Surfaces */
bg-white/5                        /* 5% white - Cards, containers */
bg-white/10                       /* 10% white - Buttons, hover states */
bg-white/15                       /* 15% white - Active/selected states */
bg-white/[0.07]                   /* 7% white - Subtle hover (alternative syntax) */

/* Overlays */
bg-black/95                       /* 95% black - Mobile menu overlay */
bg-black/40                       /* 40% black - Image overlays */
backdrop-blur-xl                  /* Extra large blur for modals */
backdrop-blur-3xl                 /* Ultra blur for forms */
```

**Pattern:** All backgrounds use opacity-based white overlays on `neutral-950` base

#### 1.2 Text Colors
```css
/* Text Hierarchy (Dark Theme Only) */
text-white                        /* 100% - Primary headings, important text */
text-white/90                     /* 90% - Secondary headings, emphasized text */
text-white/80                     /* 80% - Navigation links, tertiary text */
text-white/70                     /* 70% - Body text, descriptions */
text-white/60                     /* 60% - Muted text, labels (MOST COMMON) */
text-white/50                     /* 50% - Very subtle text, dividers */
text-white/40                     /* 40% - Placeholders */

/* Hover States */
hover:text-white                  /* Full white on hover */
hover:text-white/90               /* 90% white on hover */
```

**Usage Pattern:**
- Headings: `text-white` or `text-white/90`
- Body: `text-white/70` or `text-white/60`
- Labels/Badges: `text-white/60` or `text-white/50`
- Links: `text-white/80` with `hover:text-white`

#### 1.3 Border Colors
```css
border-white/10                   /* 10% white - Default borders (MOST COMMON) */
border-white/20                   /* 20% white - Active/selected borders */
border-white/15                   /* 15% white - Elevated borders */
border-emerald-400/30             /* 30% emerald - Accent borders (badges) */
```

**Pattern:** All borders use white opacity, no solid colors

#### 1.4 Accent Colors (Minimal Usage)
```css
/* Success/Positive States */
bg-emerald-500/10                 /* 10% emerald background */
text-emerald-400                  /* Emerald text */
border-emerald-400/30             /* Emerald border */

/* Primary CTA Button */
bg-zinc-100                       /* Light gray - Primary button */
text-zinc-900                     /* Dark text on light button */
hover:bg-white                    /* White on hover */
```

**Note:** Brand colors (red/orange) are **NOT USED** in this design system

#### 1.5 Gradient Patterns
```css
/* Text Gradients */
text-transparent bg-clip-text
background-image: linear-gradient(180deg, #fff, rgba(255,255,255,0.65))

/* Border Gradients */
bg-gradient-to-r from-transparent via-white/10 to-transparent
bg-gradient-to-b from-transparent via-white/10 to-transparent

/* Radial Gradients */
radial-gradient(600px 280px at 60% 40%, rgba(255,255,255,0.07), transparent 60%)
radial-gradient(circle_at_50%_50%, rgba(255,255,255,0.1)_0%, transparent_50%)
```

---

### 2. TYPOGRAPHY SYSTEM

#### 2.1 Font Families
```css
/* Primary Font - Body Text */
font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial

/* Secondary Font - Headings */
.font-geist {
  font-family: 'Geist', sans-serif !important;
}

/* Weights Available */
font-weight: 300  /* Light */
font-weight: 400  /* Normal - DEFAULT */
font-weight: 500  /* Medium */
font-weight: 600  /* Semibold - Headings */
font-weight: 700  /* Bold - Rare */
```

**Configuration:**
- Inter: `wght@300;400;500;600` (Google Fonts)
- Geist: `wght@300;400;500;600;700` (Google Fonts)
- Both use `display=swap` for performance

#### 2.2 Font Size Scale
```css
/* Display Sizes */
text-7xl                          /* 72px - Hero headings (md:text-7xl) */
text-6xl                          /* 60px - Large hero (sm:text-6xl) */
text-5xl                          /* 48px - Section headings */

/* Heading Sizes */
text-4xl                          /* 36px - H1 */
text-3xl                          /* 30px - H2 (sm:text-3xl) */
text-2xl                          /* 24px - H3 */
text-xl                           /* 20px - H4 */

/* Body Sizes */
text-lg                           /* 18px - Large body */
text-base                         /* 16px - Default body (sm:text-base) */
text-sm                           /* 14px - Small body (MOST COMMON) */
text-xs                           /* 12px - Tiny text */
text-[11px]                       /* Custom tiny - Badges, labels */
```

**Responsive Pattern:**
- Mobile-first: `text-5xl md:text-6xl lg:text-7xl`
- Most common: `text-sm` for body text

#### 2.3 Font Weights
```css
font-normal                       /* 400 - Default body text */
font-medium                       /* 500 - Emphasis, buttons */
font-semibold                     /* 600 - Headings (MOST COMMON) */
font-bold                         /* 700 - Rare, strong emphasis */
```

**Pattern:** Most text uses `font-normal`, headings use `font-semibold`

#### 2.4 Letter Spacing
```css
tracking-tight                    /* -0.025em - Headings (MOST COMMON) */
tracking-normal                   /* 0em - Default */
tracking-wider                    /* 0.05em - Uppercase labels */
tracking-widest                   /* 0.1em - Badges, uppercase text */
```

**Pattern:** Headings use `tracking-tight`, uppercase labels use `tracking-widest`

#### 2.5 Line Height
```css
leading-[0.95]                    /* Tight - Hero headings */
leading-relaxed                   /* 1.625 - Body text (MOST COMMON) */
leading-none                      /* 1 - Tight headings */
```

---

### 3. SPACING SYSTEM

#### 3.1 Padding Scale
```css
/* Component Padding */
p-2                               /* 8px - Tight chips/badges */
p-3                               /* 12px - Small elements */
p-4                               /* 16px - Default (MOST COMMON) */
p-5                               /* 20px - Medium */
p-6                               /* 24px - Large cards */
p-8                               /* 32px - Extra large */

/* Explicit Sides */
pt-1 pr-3 pb-1 pl-3              /* Badge padding */
pt-2 pr-4 pb-2 pl-4              /* Button padding */
pt-3 pr-4 pb-3 pl-4              /* Large button padding */
pt-4 pr-4 pb-4 pl-4              /* Card padding */
pt-5 pr-5 pb-5 pl-5              /* Large card padding */
pt-6 pr-6 pb-6 pl-6              /* Section padding */
pt-8 pr-8 pb-8 pl-8              /* Form container padding */

/* Responsive Padding */
px-4 sm:px-5                      /* Responsive horizontal */
py-16 md:py-24                    /* Responsive vertical sections */
pt-16 pr-6 pb-16 pl-6             /* Section padding */
```

**Common Patterns:**
- Cards: `p-4` or `p-6`
- Buttons: `px-4 py-2` (default), `px-5 py-3` (large)
- Forms: `p-8`
- Sections: `py-16 md:py-24` or `pt-16 pr-6 pb-16 pl-6`

#### 3.2 Gap Scale
```css
gap-2                             /* 8px - Tight */
gap-2.5                           /* 10px - Small */
gap-3                             /* 12px - Default */
gap-4                             /* 16px - Medium */
gap-6                             /* 24px - Large */
gap-8                             /* 32px - Extra large */
gap-10                            /* 40px - Sections */
gap-12                            /* 48px - Large sections */
```

**Common Patterns:**
- Grids: `gap-4` or `gap-6`
- Flex containers: `gap-2` or `gap-3`
- Sections: `gap-10` or `gap-12`

#### 3.3 Margin Scale
```css
mt-1, mb-1                        /* 4px - Tight */
mt-2, mb-2                        /* 8px - Small */
mt-3, mb-3                        /* 12px - Default */
mt-4, mb-4                        /* 16px - Medium */
mt-5, mb-5                        /* 20px */
mt-6, mb-6                        /* 24px - Large */
mt-8, mb-8                        /* 32px */
mt-10, mb-10                      /* 40px - Sections */
mt-12, mb-12                      /* 48px - Large sections */
```

**Common Patterns:**
- Between elements: `mt-3` or `mt-4`
- Section spacing: `mt-10` or `mt-12`

---

### 4. BORDER RADIUS SYSTEM

```css
rounded                            /* 4px - Small */
rounded-lg                        /* 8px - Small cards */
rounded-xl                        /* 12px - Medium cards */
rounded-2xl                       /* 16px - Cards (MOST COMMON) */
rounded-3xl                       /* 24px - Hero elements, large cards */
rounded-full                      /* 50% - Buttons, badges, pills */
```

**Pattern:**
- Cards: `rounded-2xl` (most common)
- Buttons: `rounded-full` or `rounded-2xl`
- Badges: `rounded-full`
- Hero elements: `rounded-3xl`

---

### 5. EFFECTS & ANIMATIONS

#### 5.1 Backdrop Blur
```css
backdrop-blur                     /* Default blur */
backdrop-blur-sm                  /* Small blur */
backdrop-blur-md                  /* Medium blur */
backdrop-blur-xl                  /* Extra large - Mobile menu, modals */
backdrop-blur-3xl                 /* Ultra blur - Forms */
```

**Usage:**
- Cards: `backdrop-blur` or `backdrop-blur-sm`
- Mobile menu: `backdrop-blur-xl`
- Forms: `backdrop-blur-3xl`

#### 5.2 Shadows
```css
shadow-sm                         /* Small shadow */
shadow-lg                         /* Large shadow */
shadow-2xl                        /* Extra large shadow - Testimonial cards */
shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),...]  /* Custom multi-layer shadow */
```

**Pattern:** Most elements use minimal or no shadow, cards use `shadow-2xl` for depth

#### 5.3 Transitions
```css
transition                        /* All properties */
transition-colors                 /* Colors only */
transition-all                    /* All + transform */
transition-transform duration-300 /* Transform with duration */
```

**Common Patterns:**
- Hover: `transition-colors` or `transition-all`
- Animations: `transition-transform duration-300`

#### 5.4 Hover Effects
```css
hover:bg-white/10                 /* Background change */
hover:bg-white/15                 /* Stronger background change */
hover:-translate-y-0.5            /* Subtle lift */
hover:-translate-y-1               /* More lift */
hover:scale-[1.02]                /* Slight scale */
hover:scale-105                   /* Image scale on hover */
```

**Pattern:** Buttons lift (`hover:-translate-y-0.5`), cards change background

#### 5.5 Custom Animations

**fadeSlideIn** (Most Common)
```css
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

/* Usage */
animation: fadeSlideIn 1.0s ease-out 0.1s both;
/* Delays increment: 0.1s, 0.2s, 0.3s, etc. */
```

**scrollBlur** (Parallax Effect)
```css
@keyframes scrollBlur {
  from { filter: blur(0px); }
  to { filter: blur(100px); }
}

/* Usage */
animation: scrollBlur linear both;
animation-timeline: view();
animation-range: entry 100% entry 200%;
```

**fadeInSlideBlur** (Horizontal Slide)
```css
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

**Scroll-Triggered Animations**
```javascript
// IntersectionObserver-based animation system
.animate-on-scroll {
  animation-play-state: paused !important;
}

.animate-on-scroll.animate {
  animation-play-state: running !important;
}

// Usage in HTML
<div class="animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.1s both;">
```

---

### 6. ADVANCED EFFECTS

#### 6.1 Border Gradient Effect
```css
.border-gradient {
  position: relative;
}

.border-gradient::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  background: linear-gradient(225deg, 
    rgba(255, 255, 255, 0.0) 0%, 
    rgba(255, 255, 255, 0.2) 50%, 
    rgba(255, 255, 255, 0.0) 100%);
  pointer-events: none;
}
```

**Usage:** Applied to cards, buttons, badges for premium glassmorphic border

#### 6.2 FxFilter Liquid Glass Effect
```css
/* Advanced glassmorphism effect */
[--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]

/* Variants */
[--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0.05)]
```

**Usage:** Applied to premium cards, buttons, badges for advanced glassmorphism  
**Requires:** `FxFilter.js` library (`https://www.aura.build/FxFilter.js`)

**Pattern:** Combined with `border-gradient` for maximum premium effect

---

### 7. COMPONENT PATTERNS

#### 7.1 Button Patterns

**Primary Button (Light)**
```html
<button class="border-gradient before:rounded-2xl 
               group inline-flex items-center justify-center gap-2 
               rounded-2xl 
               bg-zinc-100 text-zinc-900 
               hover:bg-white 
               px-4 sm:px-5 py-3 
               text-sm font-medium tracking-tight 
               transition-all hover:-translate-y-0.5">
  <span class="iconify text-base" data-icon="solar:play-bold-duotone"></span>
  <span>Join Now</span>
</button>
```

**Secondary Button (Glassmorphic)**
```html
<button class="border-gradient before:rounded-2xl 
               group inline-flex 
               hover:bg-white/10 
               transition-all hover:-translate-y-0.5 
               text-sm text-white tracking-tight 
               rounded-2xl pt-3 pr-4 pb-3 pl-4 
               [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)] 
               gap-2 items-center justify-center">
  <span class="iconify text-base" data-icon="solar:arrow-right-bold-duotone"></span>
  <span>View Memberships</span>
</button>
```

**Tertiary Button (Simple Glassmorphic)**
```html
<button class="inline-flex gap-2 transition 
               hover:bg-white/15 
               focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 
               text-sm font-normal text-white/90 font-geist 
               bg-white/10 border-white/10 border 
               rounded-full pt-2 pr-4 pb-2 pl-4 backdrop-blur items-center">
  Join Now
</button>
```

**Button Variants:**
1. **Primary:** Light button (`bg-zinc-100`, `text-zinc-900`) - Main CTA
2. **Secondary:** Glassmorphic with FxFilter - Secondary actions
3. **Tertiary:** Simple glassmorphic (`bg-white/10`) - Navigation, links

#### 7.2 Card Patterns

**Standard Card**
```html
<div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
  <!-- Content -->
</div>
```

**Premium Card (with Border Gradient + FxFilter)**
```html
<div class="border-gradient before:rounded-2xl 
            overflow-hidden aspect-[16/12] 
            [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0.05)] 
            rounded-3xl pt-4 pr-4 pb-4 pl-4 relative">
  <!-- Content -->
</div>
```

**Card with Hover**
```html
<div class="group hover:bg-white/10 transition-colors 
            bg-white/5 border-white/10 border 
            rounded-xl pt-5 pr-5 pb-5 pl-5 backdrop-blur">
  <!-- Content -->
</div>
```

**Card Variants:**
1. **Standard:** `bg-white/5`, `border-white/10`, `rounded-2xl`, `backdrop-blur`
2. **Premium:** Adds `border-gradient` and `[--fx-filter]`
3. **Interactive:** Adds `hover:bg-white/10` and `transition-colors`

#### 7.3 Badge/Label Patterns

**Standard Badge**
```html
<span class="inline-flex items-center gap-2 
             text-[11px] uppercase text-white/70 tracking-widest font-geist 
             bg-white/5 border-white/10 border 
             rounded-full pt-1 pr-3 pb-1 pl-3">
  <svg>...</svg>
  Label Text
</span>
```

**Premium Badge (with Effects)**
```html
<span class="border-gradient before:rounded-2xl 
             inline-flex items-center gap-2 
             rounded-2xl px-2.5 py-1.5 
             [--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]">
  <div class="h-6 w-6 grid place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
    <span class="iconify text-sm" data-icon="solar:shield-user-bold-duotone"></span>
  </div>
  <span class="text-xs text-white/70">Elevate Your Performance</span>
</span>
```

**Accent Badge**
```html
<span class="inline-flex items-center gap-1 
             rounded-full border border-emerald-400/30 
             bg-emerald-500/10 text-emerald-300 
             px-2 py-0.5 text-[11px] uppercase tracking-widest font-geist">
  <svg>...</svg>
  Most Popular
</span>
```

#### 7.4 Form Input Patterns

**Input Field**
```html
<input type="text" 
       class="w-full px-4 py-3 
              bg-white/5 border border-white/10 
              rounded-xl 
              text-white/90 placeholder-white/40 
              focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 
              transition font-geist" 
       placeholder="John Doe">
```

**Pattern:**
- Background: `bg-white/5`
- Border: `border-white/10`
- Focus: `focus:ring-2 focus:ring-white/20 focus:border-white/20`
- Text: `text-white/90`
- Placeholder: `placeholder-white/40`

#### 7.5 Navigation Patterns

**Desktop Navigation Link**
```html
<a href="programs.html" 
   class="hover:text-white/90 transition 
          text-sm font-normal text-white/80 font-geist">
  Programs
</a>
```

**Mobile Navigation Link**
```html
<a href="programs.html" 
   class="block hover:text-white transition 
          text-2xl font-normal text-white/80 font-geist">
  Programs
</a>
```

**Active State**
```html
<a href="membership.html" 
   class="hover:text-white/90 transition 
          text-sm font-medium text-white font-geist">
  Pricing
</a>
```

**Pattern:**
- Default: `text-white/80`
- Hover: `hover:text-white/90` or `hover:text-white`
- Active: `text-white` with `font-medium`

---

### 8. LAYOUT PATTERNS

#### 8.1 Container Pattern
```html
<div class="lg:px-8 max-w-7xl mr-auto ml-auto pr-6 pl-6">
  <!-- Content -->
</div>

<!-- Alternative -->
<div class="max-w-7xl mx-auto px-6 md:px-10">
  <!-- Content -->
</div>
```

**Pattern:** `max-w-7xl` container with responsive padding

#### 8.2 Section Pattern
```html
<section class="z-20 border-white/10 border-t relative py-16 md:py-24">
  <div class="lg:px-8 max-w-7xl mr-auto ml-auto pt-16 pr-6 pb-16 pl-6">
    <!-- Content -->
  </div>
</section>
```

**Pattern:**
- Section: `border-t border-white/10`, `py-16 md:py-24`
- Container: `max-w-7xl`, responsive padding

#### 8.3 Grid Layouts
```html
<!-- Standard Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Items -->
</div>

<!-- Hero Grid -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-start">
  <div class="lg:col-span-5">...</div>
  <div class="lg:col-span-7">...</div>
</div>
```

**Pattern:** Mobile-first grids with responsive columns

#### 8.4 Background Patterns

**Fixed Background Image**
```html
<div class="fixed top-0 w-full -z-10 h-screen bg-cover bg-center" 
     style="background-image: url(...); 
            animation: scrollBlur linear both; 
            animation-timeline: view(); 
            animation-range: entry 100% entry 200%;">
</div>
```

**Gradient Overlays**
```html
<!-- Vignette Effect -->
<div class="pointer-events-none absolute inset-0 rounded-3xl" 
     style="background: radial-gradient(600px 280px at 60% 40%, 
            rgba(255,255,255,0.07), transparent 60%)">
</div>

<!-- Divider Gradient -->
<div class="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
```

---

### 9. INTERACTIVE COMPONENTS

#### 9.1 Mobile Navigation Menu
```html
<!-- Mobile Menu Button -->
<button id="mobile-menu-button" 
        class="lg:hidden inline-flex transition hover:bg-white/15 
               focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 
               text-sm font-normal text-white/90 font-geist 
               bg-white/10 border-white/10 border 
               rounded-full pt-2 pr-4 pb-2 pl-4 backdrop-blur 
               gap-x-2 gap-y-2 items-center">
  <!-- Menu Icon -->
</button>

<!-- Mobile Menu Overlay -->
<div id="mobile-menu" 
     class="lg:hidden fixed inset-0 
            bg-black/95 backdrop-blur-xl 
            z-50 opacity-0 invisible 
            transition-all duration-300 ease-out">
  <div class="flex flex-col h-full pt-6 pb-8 px-6">
    <!-- Navigation Links -->
    <nav class="flex-1">
      <div class="space-y-6">
        <a href="..." class="block hover:text-white transition 
                             text-2xl font-normal text-white/80 font-geist">
          Programs
        </a>
      </div>
    </nav>
  </div>
</div>
```

**Features:**
- Full-screen overlay: `bg-black/95 backdrop-blur-xl`
- Large text: `text-2xl` for mobile links
- Smooth transitions: `transition-all duration-300`
- Body scroll lock when open

#### 9.2 Testimonial Card Stack
```css
.testimonial-card {
  position: absolute;
  width: 100%;
  top: 50%;
  left: 0;
  right: 0;
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform-origin: center;
}

.testimonial-card.active {
  z-index: 5;
  transform: translateY(-50%) scale(1) rotateZ(0deg);
  opacity: 1;
}

.testimonial-card.next-1 {
  z-index: 4;
  transform: translateY(-50%) translateY(-20px) scale(0.95) rotateZ(-2deg);
  opacity: 0.7;
}

.testimonial-card.next-2 {
  z-index: 3;
  transform: translateY(-50%) translateY(-40px) scale(0.9) rotateZ(-4deg);
  opacity: 0.4;
}
```

**Pattern:** Stacked cards with rotation and scale effects

---

### 10. ICON SYSTEM

#### 10.1 Icon Library
- **Primary:** Iconify (`https://code.iconify.design/3/3.1.0/iconify.min.js`)
- **Secondary:** Lucide Icons (SVG inline)

#### 10.2 Icon Usage Patterns

**Iconify Icons**
```html
<span class="iconify text-base" data-icon="solar:shield-user-bold-duotone"></span>
<span class="iconify text-sm" data-icon="solar:play-bold-duotone"></span>
```

**Lucide Icons (SVG)**
```html
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
     fill="none" stroke="currentColor" stroke-width="1.5" 
     stroke-linecap="round" stroke-linejoin="round" 
     class="lucide lucide-menu w-[16px] h-[16px]">
  <path d="M4 5h16"></path>
</svg>
```

**Icon Sizes:**
- `text-sm` - Small icons (14px)
- `text-base` - Default icons (16px)
- `w-[16px] h-[16px]` - Explicit sizing
- `w-4 h-4` - Tailwind sizing

---

### 11. RESPONSIVE BREAKPOINTS

```css
/* Tailwind Default Breakpoints */
sm: 640px    /* Small devices */
md: 768px    /* Medium devices */
lg: 1024px   /* Large devices */
xl: 1280px   /* Extra large */
2xl: 1536px  /* 2X large */
```

**Common Patterns:**
- Mobile-first: `text-5xl md:text-6xl lg:text-7xl`
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Padding: `px-4 lg:px-8`
- Visibility: `hidden lg:flex`

---

### 12. ACCESSIBILITY PATTERNS

#### 12.1 Focus States
```css
focus:outline-none 
focus-visible:ring-2 
focus-visible:ring-white/60 
focus-visible:ring-offset-2 
focus-visible:ring-offset-neutral-950
```

**Pattern:** All interactive elements have visible focus rings

#### 12.2 Semantic HTML
- Proper heading hierarchy (`h1`, `h2`, `h3`)
- Semantic sections (`<header>`, `<nav>`, `<section>`, `<footer>`)
- ARIA labels where needed
- Proper form labels

#### 12.3 Skip Links
```css
.skip-link {
  @apply sr-only 
         focus:not-sr-only 
         focus:absolute focus:top-4 focus:left-4 focus:z-[9999] 
         focus:px-4 focus:py-2 
         focus:bg-white focus:text-black 
         focus:rounded focus:font-medium;
}
```

---

### 13. PERFORMANCE OPTIMIZATIONS

#### 13.1 Font Loading
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
```

**Pattern:** Preconnect + `display=swap` for performance

#### 13.2 Image Optimization
- All images hosted on Supabase CDN
- Proper `alt` attributes
- Lazy loading where appropriate
- Responsive images with `aspect-ratio`

#### 13.3 Animation Performance
- CSS animations (GPU-accelerated)
- IntersectionObserver for scroll animations
- `will-change` where needed
- Reduced motion support

---

### 14. CODE STRUCTURE PATTERNS

#### 14.1 HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Meta tags -->
  <!-- Fonts -->
  <!-- Styles -->
  <!-- Inline animations -->
</head>
<body class="min-h-screen antialiased overflow-x-hidden text-white bg-neutral-950">
  <!-- Fixed background -->
  <!-- Navigation -->
  <!-- Main content sections -->
  <!-- Footer -->
  <!-- Scripts -->
</body>
</html>
```

#### 14.2 Inline Styles for Animations
```html
<style class="">
  @keyframes fadeSlideIn {
    0% { opacity: 0; transform: translateY(30px); filter: blur(8px); }
    100% { opacity: 1; transform: translateY(0); filter: blur(0px); }
  }
</style>

<div class="animate-on-scroll" style="animation: fadeSlideIn 1.0s ease-out 0.1s both;">
  <!-- Content -->
</div>
```

**Pattern:** Keyframes defined inline, applied via inline styles with delays

#### 14.3 JavaScript Patterns
```javascript
// IntersectionObserver for scroll animations
(function () {
  const style = document.createElement("style");
  style.textContent = `
    .animate-on-scroll { animation-play-state: paused !important; }
    .animate-on-scroll.animate { animation-play-state: running !important; }
  `;
  document.head.appendChild(style);

  if (!window.__inViewIO) {
    window.__inViewIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
        }
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });
  }

  window.initInViewAnimations = function (selector = ".animate-on-scroll") {
    document.querySelectorAll(selector).forEach((el) => {
      window.__inViewIO.observe(el);
    });
  };

  document.addEventListener("DOMContentLoaded", () => initInViewAnimations());
})();
```

---

### 15. UNIQUE FEATURES

#### 15.1 FxFilter Integration
- **Library:** `https://www.aura.build/FxFilter.js`
- **Effect:** Advanced liquid glass effect
- **Usage:** `[--fx-filter:blur(10px)_liquid-glass(5,10)_saturate(1.25)_noise(0.5,1,0)]`
- **Applied To:** Premium cards, buttons, badges

#### 15.2 Border Gradient Animation
- **Class:** `.border-gradient`
- **Effect:** Animated gradient border via `::before` pseudo-element
- **Pattern:** 225deg gradient with white opacity transitions

#### 15.3 Scroll-Based Parallax
- **Animation:** `scrollBlur` with `animation-timeline: view()`
- **Effect:** Background blur increases on scroll
- **Usage:** Hero background images

#### 15.4 Testimonial Stack Animation
- **Effect:** 3D card stack with rotation and scale
- **Interaction:** Click to cycle through cards
- **Animation:** Smooth cubic-bezier transitions

---

### 16. DESIGN SYSTEM COMPARISON

#### Current Platform vs Target Design System

| Aspect | Current Platform | Target Design System |
|--------|-----------------|---------------------|
| **Background** | `bg-neutral-950` ✅ | `bg-neutral-950` ✅ |
| **Brand Colors** | Red/Orange preserved ❌ | No brand colors ✅ |
| **Glassmorphism** | Basic (`bg-white/5`) ✅ | Advanced (FxFilter) ⚠️ |
| **Border Effects** | Basic borders ✅ | Animated gradients ⚠️ |
| **Typography** | Geist + Inter ✅ | Geist + Inter ✅ |
| **Button Styles** | Mixed variants ⚠️ | Consistent patterns ✅ |
| **Card Patterns** | Standard + Premium ⚠️ | Unified premium ✅ |
| **Animations** | Basic fadeSlideIn ✅ | Advanced scroll effects ⚠️ |
| **Theme Support** | Light + Dark ⚠️ | Dark only ✅ |

**Key Differences:**
1. **No Brand Colors:** Target system removes red/orange completely
2. **Advanced Effects:** FxFilter liquid glass effects
3. **Border Gradients:** Animated gradient borders
4. **Dark Only:** No light theme support
5. **Unified Patterns:** Single consistent component system

---

### 17. MIGRATION REQUIREMENTS

#### 17.1 New Dependencies
```json
{
  "dependencies": {
    "@iconify/iconify": "^3.1.0"  // For Iconify icons
  }
}
```

**External Scripts:**
- `https://code.iconify.design/3/3.1.0/iconify.min.js`
- `https://www.aura.build/FxFilter.js` (optional, for advanced effects)

#### 17.2 CSS Additions
- `.border-gradient` utility class
- FxFilter CSS custom properties
- Enhanced animation keyframes
- Scroll animation utilities

#### 17.3 Component Updates Required
1. **Buttons:** Migrate to 3 variants (primary light, secondary glassmorphic, tertiary simple)
2. **Cards:** Add border-gradient and FxFilter effects
3. **Badges:** Update to premium patterns
4. **Forms:** Update input styling
5. **Navigation:** Enhance mobile menu
6. **Layout:** Update section patterns

#### 17.4 Removal Requirements
1. **Remove:** Red/orange brand colors from dark theme
2. **Remove:** Light theme support (or keep minimal)
3. **Remove:** Premium component folder (consolidate)
4. **Remove:** Mixed color patterns

---

### 18. IMPLEMENTATION PRIORITY

#### Phase 1: Foundation (Critical)
1. ✅ Update CSS variables (remove brand colors)
2. ✅ Add border-gradient utility
3. ✅ Update typography system
4. ✅ Standardize spacing

#### Phase 2: Components (High Priority)
1. ✅ Update Button component (3 variants)
2. ✅ Update Card component (premium effects)
3. ✅ Update Badge component
4. ✅ Update Form inputs

#### Phase 3: Layout (Medium Priority)
1. ✅ Update Navbar (enhanced mobile menu)
2. ✅ Update Footer
3. ✅ Update section patterns
4. ✅ Add scroll animations

#### Phase 4: Advanced Effects (Low Priority)
1. ⚠️ Add FxFilter integration (optional)
2. ⚠️ Enhanced parallax effects
3. ⚠️ Testimonial stack component

---

### 19. CODE EXAMPLES

#### 19.1 Complete Button Example
```tsx
// Primary Button (Light)
<button className="border-gradient before:rounded-2xl 
                   group inline-flex items-center justify-center gap-2 
                   rounded-2xl 
                   bg-zinc-100 text-zinc-900 
                   hover:bg-white 
                   px-4 sm:px-5 py-3 
                   text-sm font-medium tracking-tight 
                   transition-all hover:-translate-y-0.5">
  <Iconify icon="solar:play-bold-duotone" className="text-base" />
  <span>Join Now</span>
</button>

// Secondary Button (Glassmorphic)
<button className="border-gradient before:rounded-2xl 
                   group inline-flex 
                   hover:bg-white/10 
                   transition-all hover:-translate-y-0.5 
                   text-sm text-white tracking-tight 
                   rounded-2xl pt-3 pr-4 pb-3 pl-4 
                   gap-2 items-center justify-center">
  <Iconify icon="solar:arrow-right-bold-duotone" className="text-base" />
  <span>View Memberships</span>
</button>
```

#### 19.2 Complete Card Example
```tsx
// Premium Card
<div className="border-gradient before:rounded-2xl 
                overflow-hidden aspect-[16/12] 
                rounded-3xl pt-4 pr-4 pb-4 pl-4 relative">
  <div className="text-xs text-white/60">Locations</div>
  <div className="mt-1 text-lg font-medium tracking-tight text-white">25+</div>
</div>

// Standard Card
<div className="bg-white/5 border border-white/10 
                rounded-2xl p-6 backdrop-blur">
  <h3 className="text-lg font-medium tracking-tight font-geist">Title</h3>
  <p className="mt-1 text-sm text-white/60 font-geist">Description</p>
</div>
```

#### 19.3 Complete Badge Example
```tsx
// Premium Badge
<span className="border-gradient before:rounded-2xl 
                 inline-flex items-center gap-2 
                 rounded-2xl px-2.5 py-1.5">
  <div className="h-6 w-6 grid place-items-center rounded-xl 
                  bg-emerald-500/10 text-emerald-400">
    <Iconify icon="solar:shield-user-bold-duotone" className="text-sm" />
  </div>
  <span className="text-xs text-white/70">Elevate Your Performance</span>
</span>

// Standard Badge
<span className="inline-flex items-center gap-2 
                 text-[11px] uppercase text-white/70 tracking-widest font-geist 
                 bg-white/5 border-white/10 border 
                 rounded-full pt-1 pr-3 pb-1 pl-3">
  <Iconify icon="solar:sparkles" className="h-3.5 w-3.5" />
  Label Text
</span>
```

---

### 20. STATISTICS & METRICS

#### 20.1 Design Token Usage
- **Color Classes:** 200+ instances of `bg-white/X` patterns
- **Text Opacity:** 150+ instances of `text-white/X` patterns
- **Border Patterns:** 100+ instances of `border-white/X`
- **Glassmorphism:** 80+ instances of `backdrop-blur`
- **Border Gradient:** 30+ instances of `.border-gradient`
- **FxFilter:** 25+ instances of `[--fx-filter]`

#### 20.2 Component Patterns
- **Buttons:** 3 distinct variants
- **Cards:** 2 main variants (standard + premium)
- **Badges:** 3 variants (standard + premium + accent)
- **Forms:** Consistent input patterns
- **Navigation:** Desktop + mobile patterns

#### 20.3 Animation Usage
- **fadeSlideIn:** Used on 80% of sections
- **scrollBlur:** Used on hero backgrounds
- **Scroll-triggered:** IntersectionObserver on all animated elements

---

### 21. MIGRATION COMPLEXITY ASSESSMENT

#### Low Complexity ✅
- Updating CSS variables
- Standardizing color usage
- Updating typography
- Basic component updates

#### Medium Complexity ⚠️
- Adding border-gradient utility
- Implementing scroll animations
- Updating all component variants
- Mobile navigation enhancements

#### High Complexity 🔴
- FxFilter integration (optional)
- Advanced parallax effects
- Testimonial stack component
- Complete design system overhaul

---

### 22. RECOMMENDATIONS

#### 22.1 Must-Have Features
1. ✅ Remove brand colors (red/orange) from dark theme
2. ✅ Implement border-gradient utility
3. ✅ Standardize button variants (3 types)
4. ✅ Update card patterns with glassmorphism
5. ✅ Enhance mobile navigation
6. ✅ Add scroll-triggered animations

#### 22.2 Nice-to-Have Features
1. ⚠️ FxFilter liquid glass effects (requires external library)
2. ⚠️ Advanced parallax backgrounds
3. ⚠️ Testimonial stack component
4. ⚠️ Enhanced hover effects

#### 22.3 Migration Strategy
1. **Phase 1:** Foundation (CSS variables, utilities)
2. **Phase 2:** Core components (buttons, cards, badges)
3. **Phase 3:** Layout components (navbar, footer, sections)
4. **Phase 4:** Advanced effects (optional enhancements)
5. **Phase 5:** Page migration (systematic page updates)

---

## 📋 COMPLETE DESIGN TOKEN REFERENCE

### Quick Reference Card

```css
/* Colors */
bg-neutral-950                   /* Background */
bg-white/5                        /* Cards */
bg-white/10                       /* Buttons */
text-white                        /* Headings */
text-white/60                     /* Body */
text-white/80                     /* Links */
border-white/10                   /* Borders */

/* Typography */
font-geist                        /* Headings */
font-inter                        /* Body */
text-sm                           /* Body size */
font-semibold                     /* Heading weight */
tracking-tight                    /* Heading spacing */

/* Effects */
backdrop-blur                     /* Glassmorphism */
border-gradient                   /* Animated border */
rounded-2xl                       /* Card radius */
rounded-full                      /* Button radius */

/* Animations */
fadeSlideIn                      /* Entry animation */
animate-on-scroll                 /* Scroll trigger */
```

---

## 🎯 NEXT STEPS

1. **Review this analysis** with design team
2. **Decide on FxFilter** - Required or optional?
3. **Create migration plan** with phased approach
4. **Set up design tokens** in Next.js project
5. **Begin component migration** starting with buttons and cards

---

**Analysis Complete** ✅  
**Ready for Migration Planning** 🚀

