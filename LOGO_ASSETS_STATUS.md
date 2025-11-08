# 🎨 Logo Assets Setup - Quick Guide

## Current Status

✅ **Existing:**
- `/public/logos/derrimut-logo-seeklogo.png` - Primary logo (exists)

❌ **Missing:**
- `/public/logos/derrimut-logo-white.png` - White variant for dark mode
- `/public/logos/derrimut-icon.png` - Favicon/icon version
- `/public/favicon.ico` - Browser favicon

## Quick Setup Options

### Option 1: Use Existing Logo (Temporary)
The existing `derrimut-logo-seeklogo.png` can be used temporarily for all variants.

### Option 2: Download from Sources
1. **SeekLogo:** https://seeklogo.com/vector-logo/226468/derrimut-247-gym
2. **Derrimut Website:** https://www.derrimut247.com.au (inspect page source)

### Option 3: Create Variants from Existing
1. **White Logo:** Invert colors or apply white filter
2. **Icon:** Resize to 32x32 or 64x64px
3. **Favicon:** Convert icon to .ico format

## Files Needed

```
public/
├── logos/
│   ├── derrimut-logo-seeklogo.png ✅ (exists)
│   ├── derrimut-logo-white.png ❌ (needed)
│   └── derrimut-icon.png ❌ (needed)
└── favicon.ico ❌ (needed)
```

## Code References

The logo paths are defined in `src/constants/branding.ts`:
- Primary: `/logos/derrimut-logo-seeklogo.png`
- White: `/logos/derrimut-logo-white.png`
- Icon: `/logos/derrimut-icon.png`
- Favicon: `/favicon.ico`

## Next Steps

1. Download or create white logo variant
2. Create icon version (32x32 or 64x64px)
3. Create favicon.ico
4. Update fallback references from `/logo.png` to Derrimut logo

