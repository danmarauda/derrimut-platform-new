# 🎨 DERRIMUT LOGO ASSETS - COMPLETE SETUP GUIDE

## Current Status

✅ **Primary Logo:** Downloaded (or needs download)
❌ **White Logo:** Needs creation
❌ **Icon:** Needs creation  
❌ **Favicon:** Needs creation

## Quick Fix: Download Proper Logo

The current `derrimut-logo-seeklogo.png` appears to be an HTML redirect page, not an actual image.

### Option 1: Direct Download (Recommended)

```bash
# Download from SeekLogo
curl -L "https://seeklogo.com/images/D/derrimut-247-gym-logo-2264684E96-seeklogo.com.png" \
  -o public/logos/derrimut-logo-seeklogo.png

# Or use the script
bun run scripts/download-logos.js
```

### Option 2: Manual Download

1. Visit: https://seeklogo.com/vector-logo/226468/derrimut-247-gym
2. Right-click the logo image
3. "Save image as..."
4. Save to: `public/logos/derrimut-logo-seeklogo.png`

## Create Logo Variants

### 1. White Logo (for Dark Mode)

**Method A: Using Image Editor**
- Open `derrimut-logo-seeklogo.png` in Photoshop/GIMP/Preview
- Apply white filter or invert colors
- Save as: `public/logos/derrimut-logo-white.png`

**Method B: Using CSS Filter (Temporary)**
- We can use CSS filter in code: `filter: brightness(0) invert(1)`
- But a proper white PNG is better

**Method C: Online Tool**
- Upload logo to: https://www.iloveimg.com/edit-image
- Apply white filter
- Download and save as `derrimut-logo-white.png`

### 2. Icon Version (64x64px)

**Using Online Tool:**
1. Visit: https://www.iloveimg.com/resize-image
2. Upload `derrimut-logo-seeklogo.png`
3. Resize to 64x64px (maintain aspect ratio)
4. Download and save as: `public/logos/derrimut-icon.png`

**Using Command Line (if ImageMagick installed):**
```bash
convert public/logos/derrimut-logo-seeklogo.png \
  -resize 64x64 \
  public/logos/derrimut-icon.png
```

### 3. Favicon (32x32px → .ico)

**Using Online Converter:**
1. Use the 64x64 icon or create 32x32 version
2. Visit: https://convertio.co/png-ico/
3. Upload PNG
4. Convert to ICO
5. Download and save as: `public/favicon.ico`

**Using Command Line (if ImageMagick installed):**
```bash
convert public/logos/derrimut-icon.png \
  -resize 32x32 \
  public/favicon.ico
```

## Verify Logo Files

After creating all files, verify:

```bash
ls -lh public/logos/
ls -lh public/favicon.ico
```

Should see:
- ✅ `derrimut-logo-seeklogo.png` (primary)
- ✅ `derrimut-logo-white.png` (white variant)
- ✅ `derrimut-icon.png` (64x64 icon)
- ✅ `favicon.ico` (32x32 favicon)

## Update Code

Once all files exist, update `src/constants/branding.ts`:

```typescript
logo: {
  primary: "/logos/derrimut-logo-seeklogo.png",
  white: "/logos/derrimut-logo-white.png", // ✅ Now exists
  icon: "/logos/derrimut-icon.png", // ✅ Now exists
  favicon: "/favicon.ico", // ✅ Now exists
},
```

## Test

1. Run `bun run dev`
2. Check navbar logo (light mode)
3. Switch to dark mode - check white logo appears
4. Check browser tab - favicon should appear
5. Check footer logo

---

**Status:** Waiting for logo file download and variant creation

