# Image Optimization Guide
## Derrimut Platform

This guide explains how to use optimized images in the Derrimut Platform for best performance.

---

## Quick Start

### 1. Optimize Images

```bash
# Run the optimization script
npm run optimize-images
```

This will:
- Convert images to WebP format (88% smaller)
- Generate responsive variants (640w, 750w, 828w, 1080w, 1200w, 1920w)
- Optimize PNG/JPG files
- Save optimized images to `/public/optimized/`

### 2. Use Optimized Images

```typescript
import Image from 'next/image';

// Before optimization
<Image src="/hero-ai.png" alt="Hero" width={1920} height={1080} />

// After optimization (use WebP)
<Image src="/optimized/hero-ai.webp" alt="Hero" width={1920} height={1080} />
```

---

## Optimization Results

### hero-ai.png
- **Original**: 1,114 KB
- **WebP**: 133.86 KB (88% reduction)
- **Optimized PNG**: 447.49 KB (59.8% reduction)

### Responsive Variants
- `hero-ai-640w.webp`: 23.68 KB
- `hero-ai-750w.webp`: 29.52 KB
- `hero-ai-828w.webp`: 34.51 KB
- `hero-ai-1080w.webp`: 52.83 KB
- `hero-ai-1200w.webp`: 62.89 KB
- `hero-ai-1920w.webp`: 131.76 KB

---

## Best Practices

### 1. Use Next.js Image Component

✅ **CORRECT**:
```typescript
import Image from 'next/image';

<Image
  src="/optimized/hero-ai.webp"
  alt="Derrimut Gym Hero"
  width={1920}
  height={1080}
  priority // For above-the-fold images
  sizes="(max-width: 640px) 640px, (max-width: 1080px) 1080px, 1920px"
/>
```

❌ **WRONG**:
```typescript
<img src="/hero-ai.png" alt="Hero" />
```

### 2. Specify Width and Height

Always provide explicit dimensions to prevent layout shift:

```typescript
<Image
  src="/optimized/logo.webp"
  alt="Derrimut Logo"
  width={200}
  height={100}
/>
```

### 3. Use Priority Loading

For critical images above the fold:

```typescript
<Image
  src="/optimized/hero-ai.webp"
  alt="Hero"
  width={1920}
  height={1080}
  priority // Preload this image
/>
```

### 4. Responsive Images

Use the `sizes` prop for responsive images:

```typescript
<Image
  src="/optimized/hero-ai.webp"
  alt="Hero"
  width={1920}
  height={1080}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 5. Lazy Loading

For below-the-fold images, use lazy loading (default):

```typescript
<Image
  src="/optimized/product.webp"
  alt="Product"
  width={400}
  height={300}
  loading="lazy" // Default behavior
/>
```

---

## Responsive Image Usage

### Mobile-First Approach

```typescript
<Image
  src="/optimized/hero-ai.webp"
  alt="Hero"
  width={1920}
  height={1080}
  sizes="(max-width: 640px) 640px,
         (max-width: 750px) 750px,
         (max-width: 828px) 828px,
         (max-width: 1080px) 1080px,
         (max-width: 1200px) 1200px,
         1920px"
  priority
/>
```

Next.js will automatically serve the optimal variant based on screen size.

---

## Vercel Blob Storage Integration

For large media files, use Vercel Blob storage:

### 1. Set Up Environment

```bash
# Add to .env.local
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_YOUR_TOKEN
```

### 2. Upload Image to Blob

```typescript
import { uploadOptimizedImage } from '@/lib/blob-storage';

// In a server action or API route
export async function uploadProductImage(formData: FormData) {
  const file = formData.get('image') as File;

  const blobUrl = await uploadOptimizedImage(file, {
    folder: 'products',
    maxWidth: 1920,
    quality: 85
  });

  return blobUrl;
}
```

### 3. Use Blob Image

```typescript
import Image from 'next/image';

<Image
  src="https://your-blob-store.vercel-storage.com/products/hero-ai.webp"
  alt="Product"
  width={1920}
  height={1080}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

---

## Image Optimization Checklist

### Pre-Upload
- [ ] Resize images to maximum needed dimensions
- [ ] Remove EXIF data for privacy
- [ ] Convert to WebP format
- [ ] Compress with 85% quality

### In Code
- [ ] Use Next.js `<Image>` component
- [ ] Provide explicit width and height
- [ ] Add descriptive alt text
- [ ] Use `priority` for above-the-fold images
- [ ] Specify `sizes` for responsive images
- [ ] Use lazy loading for below-the-fold images

### Post-Deployment
- [ ] Run Lighthouse audit
- [ ] Check LCP metric (< 2.5s)
- [ ] Verify CLS metric (< 0.1)
- [ ] Monitor image load times
- [ ] Check WebP support in analytics

---

## Performance Impact

### Before Optimization
- Total image size: ~1.3MB
- LCP: ~4.0s
- Page load time: ~5.0s

### After Optimization
- Total image size: ~400KB (69% reduction)
- LCP: ~2.5s (37.5% improvement)
- Page load time: ~3.5s (30% improvement)

---

## Troubleshooting

### WebP Not Supported

Next.js automatically falls back to original format. No action needed.

### Images Not Loading

1. Check file path is correct
2. Verify image exists in `/public/optimized/`
3. Check network tab for 404 errors
4. Ensure correct import path

### Slow Image Loading

1. Use `priority` for critical images
2. Verify WebP format is being used
3. Check CDN caching headers
4. Use responsive variants

### Layout Shift (CLS)

1. Always provide explicit width/height
2. Use aspect ratio boxes
3. Reserve space with CSS
4. Test on multiple devices

---

## Advanced Techniques

### 1. Blur Placeholder

```typescript
<Image
  src="/optimized/hero-ai.webp"
  alt="Hero"
  width={1920}
  height={1080}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Base64 tiny image
/>
```

### 2. Art Direction

Different images for different screen sizes:

```typescript
<picture>
  <source
    media="(max-width: 768px)"
    srcSet="/optimized/hero-ai-640w.webp"
  />
  <source
    media="(max-width: 1200px)"
    srcSet="/optimized/hero-ai-1080w.webp"
  />
  <Image
    src="/optimized/hero-ai-1920w.webp"
    alt="Hero"
    width={1920}
    height={1080}
  />
</picture>
```

### 3. Dynamic Imports for Images

```typescript
import dynamic from 'next/dynamic';

const HeroImage = dynamic(() => import('./HeroImage'), {
  loading: () => <div className="skeleton" />,
  ssr: false
});
```

---

## Scripts Reference

### Optimize All Images

```bash
npm run optimize-images
```

### Analyze Bundle Size

```bash
npm run analyze
```

### Run Lighthouse Audit

```bash
npm run lighthouse
```

---

## Resources

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)

---

**Last Updated**: November 9, 2025
**Maintained By**: Performance Engineering Team
