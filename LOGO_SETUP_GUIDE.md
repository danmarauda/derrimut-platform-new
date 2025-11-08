# 🎨 DERRIMUT LOGO SETUP GUIDE

## Quick Steps to Add Derrimut Logos

### Step 1: Download Logos

**Option 1: From SeekLogo**
1. Visit: https://seeklogo.com/vector-logo/226468/derrimut-247-gym
2. Download PNG version
3. Save as `derrimut-logo.png`

**Option 2: From Brands of the World**
1. Visit: https://www.brandsoftheworld.com/logo/derrimut-247-gym
2. Download PNG/EPS version
3. Convert to PNG if needed

**Option 3: From Derrimut Website**
1. Visit: https://www.derrimut247.com.au
2. Right-click logo → Save image
3. Or inspect page source to find logo URL

### Step 2: Create Logo Variants

**Primary Logo:**
- File: `public/logos/derrimut-logo.png`
- Format: PNG with transparent background
- Size: At least 512x512px (scalable)

**White Logo (for dark mode):**
- File: `public/logos/derrimut-logo-white.png`
- Format: PNG with transparent background
- Color: White version of logo
- Can create by inverting colors or using white filter

**Favicon:**
- File: `public/favicon.ico` or `public/logos/derrimut-icon.png`
- Size: 32x32px or 64x64px
- Format: ICO or PNG

### Step 3: Verify Logo Paths

The code expects logos at:
- `/logos/derrimut-logo.png` (primary)
- `/logos/derrimut-logo-white.png` (white variant)
- `/favicon.ico` (favicon)

### Step 4: Test

After adding logos:
1. Run `npm run dev`
2. Check navbar logo displays correctly
3. Check footer logo displays correctly
4. Check favicon in browser tab
5. Test dark/light mode logo switching

---

## 🎨 BRAND COLORS

### Current Placeholders:
- **Primary:** `#000000` (Black) ✅
- **Secondary:** `#DC143C` (Crimson Red) ⚠️ Placeholder
- **Accent:** `#FFD700` (Gold) ⚠️ Placeholder

### To Get Exact Colors:
1. Visit Derrimut website: https://www.derrimut247.com.au
2. Inspect logo colors using browser dev tools
3. Update `src/constants/branding.ts` with exact hex codes

---

## 📝 NOTES

- Logo files should be optimized for web (compressed PNG)
- White logo variant needed for dark mode
- Favicon should be square format
- All logos should have transparent backgrounds

---

**Once logos are added, the platform will be fully branded!**

