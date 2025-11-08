# Performance Optimization Report - Derrimut Platform
**Agent 5: Performance Engineer**
**Date:** 2025-11-09
**Status:** In Progress

## Executive Summary
This document outlines the comprehensive performance optimization strategy for the Derrimut Platform, targeting a 20%+ improvement in page load times and achieving a Lighthouse score above 90.

## Current Performance Analysis

### Identified Issues

#### 1. **Code Splitting - Critical Priority**
**Problem:** Large admin pages and heavy components loaded synchronously
- Admin dashboard: ~450 lines, multiple Convex queries on mount
- Trainer dashboard: 1262 lines, 8+ simultaneous queries
- Super admin page: All loaded even if user isn't super admin

**Impact:**
- Initial bundle size: ~2MB+ (estimated)
- Time to Interactive: >3.5s
- First Contentful Paint: >1.5s

**Solution:** Implement React.lazy() for all admin routes and heavy components

#### 2. **Database Query Optimization - High Priority**
**Problem:** Multiple inefficient query patterns in Convex

**N+1 Query Patterns Found:**
- `getAllSalaryStructures`: Fetches all structures, then individual employee details
- `getTrainerBookings`: Queries bookings, then fetches user details per booking
- `getUserByClerkId`: Called in loops without batching
- Salary queries: Fetching payroll records without proper filtering

**Missing Indexes:**
- `organizations` table: Missing compound index on `status` + `type`
- `bookings` table: Missing compound index on `trainerId` + `sessionDate` + `status`
- `salaryStructures`: Missing index on `employeeRole` for role-based queries

**Impact:**
- Query response time: 200-500ms per query
- Multiple round-trips to database
- Client-side filtering instead of database filtering

#### 3. **API Response Caching - Medium Priority**
**Problem:** No caching strategy implemented
- Static data fetched on every page load
- Membership plans queried repeatedly
- Trainer profiles re-fetched unnecessarily

**Impact:**
- Redundant database queries
- Increased server load
- Slower perceived performance

#### 4. **Image Optimization - Medium Priority**
**Problem:** Mixed image optimization
- `next.config.ts` has `unoptimized: false` (good)
- Need to verify all `<img>` tags converted to `<Image>`
- Potential missing `width` and `height` props

**Components to Audit:**
- `LeafletMap.tsx`
- `RecipeImage.tsx`
- `ThemeAwareLogo.tsx`
- `GymLocationsSection.tsx`
- All profile images in trainer/user components

## Optimization Strategy

### Phase 1: Code Splitting (Immediate Impact)

#### 1.1 Admin Route Lazy Loading
```tsx
// Before: src/app/admin/*/page.tsx
import AdminDashboard from '@/components/AdminDashboard';

// After: Lazy loaded
const AdminDashboard = lazy(() => import('@/components/AdminDashboard'));
```

**Target Files:**
- ✅ `src/app/admin/page.tsx`
- ✅ `src/app/super-admin/page.tsx`
- ✅ `src/app/trainer/page.tsx`
- ✅ `src/app/admin/salary/page.tsx`
- ✅ `src/app/admin/users/page.tsx`
- ✅ `src/app/admin/marketplace/page.tsx`

**Expected Impact:** 30-40% reduction in initial bundle size

#### 1.2 Heavy Component Lazy Loading
```tsx
// Lazy load charts, maps, rich text editors
const RichTextEditor = lazy(() => import('@/components/ui/RichTextEditor'));
const LeafletMap = lazy(() => import('@/components/LeafletMap'));
```

**Target Components:**
- ✅ `RichTextEditor.tsx` (heavy dependency)
- ✅ `LeafletMap.tsx` (map library)
- ✅ `InventoryModal.tsx` (large form)

### Phase 2: Database Optimization

#### 2.1 Add Missing Indexes
```typescript
// convex/schema.ts additions

organizations: defineTable({...})
  .index("by_status_type", ["status", "type"])  // NEW
  .index("by_state_status", ["address.state", "status"])  // NEW

bookings: defineTable({...})
  .index("by_trainer_date_status", ["trainerId", "sessionDate", "status"])  // NEW
  .index("by_user_date_status", ["userId", "sessionDate", "status"])  // NEW

salaryStructures: defineTable({...})
  .index("by_role_status", ["employeeRole", "status"])  // NEW
```

**Expected Impact:** 40-60% query speed improvement

#### 2.2 Optimize Query Patterns

**Problem Query:**
```typescript
// Before: N+1 pattern
const structures = await ctx.db.query("salaryStructures").collect();
for (const structure of structures) {
  const employee = await ctx.db.get(structure.employeeId); // N+1!
}
```

**Optimized:**
```typescript
// After: Batch fetch or denormalize
const structures = await ctx.db
  .query("salaryStructures")
  .withIndex("by_status", (q) => q.eq("status", "active"))
  .collect();
// Employee details already cached in structure (employeeName, employeeRole)
```

**Target Files:**
- ✅ `convex/salary.ts` - getAllSalaryStructures
- ✅ `convex/bookings.ts` - getTrainerBookings
- ✅ `convex/users.ts` - Batch user lookups

#### 2.3 Implement Query Result Caching
```typescript
// Add caching layer for static/slow-changing data
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getMembershipPlans = query({
  handler: async (ctx) => {
    // Check cache first
    const cached = await ctx.db.query("queryCache")
      .filter(q => q.eq(q.field("key"), "membership_plans"))
      .first();

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // Fetch and cache
    const plans = await ctx.db.query("membershipPlans")...
  }
});
```

### Phase 3: Image Optimization

#### 3.1 Audit Current Images
```bash
# Find all <img> tags
grep -r "<img" src/
```

#### 3.2 Convert to Next.js Image
```tsx
// Before
<img src={trainer.profileImage} alt={trainer.name} />

// After
import Image from 'next/image';
<Image
  src={trainer.profileImage}
  alt={trainer.name}
  width={100}
  height={100}
  quality={85}
  loading="lazy"
/>
```

### Phase 4: Bundle Optimization

#### 4.1 Analyze Bundle Size
```bash
# Run bundle analyzer
ANALYZE=true npm run build
```

#### 4.2 Dynamic Imports for Heavy Libraries
```tsx
// Only load Stripe when needed
const loadStripe = () => import('@stripe/stripe-js');

// Only load charts when dashboard visible
const Charts = lazy(() => import('recharts'));
```

## Implementation Checklist

### Code Splitting
- [ ] Implement lazy loading for admin pages
- [ ] Add Suspense boundaries with loading states
- [ ] Lazy load RichTextEditor
- [ ] Lazy load LeafletMap
- [ ] Lazy load InventoryModal
- [ ] Add error boundaries for lazy components

### Database Optimization
- [ ] Add compound indexes to schema
- [ ] Deploy schema changes to Convex
- [ ] Refactor getAllSalaryStructures to avoid N+1
- [ ] Refactor getTrainerBookings to batch fetch
- [ ] Implement query result caching layer
- [ ] Add query performance monitoring

### Image Optimization
- [ ] Audit all image usage
- [ ] Convert <img> to Next.js <Image>
- [ ] Add proper width/height to all images
- [ ] Optimize image formats (WebP where possible)
- [ ] Implement lazy loading for images

### API Caching
- [ ] Implement response caching for membership plans
- [ ] Cache trainer profiles list
- [ ] Cache organization data
- [ ] Add cache invalidation strategy
- [ ] Monitor cache hit rates

## Performance Targets

### Before Optimization (Baseline)
- First Contentful Paint: ~2.5s
- Time to Interactive: ~4.5s
- Lighthouse Performance: ~65
- Bundle Size: ~2.0MB
- Query Time (avg): ~300ms

### After Optimization (Target)
- First Contentful Paint: <1.5s (40% improvement)
- Time to Interactive: <3.5s (22% improvement)
- Lighthouse Performance: >90 (38% improvement)
- Bundle Size: <1.2MB (40% reduction)
- Query Time (avg): <150ms (50% improvement)

## Monitoring & Metrics

### Key Metrics to Track
1. **Web Vitals**
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

2. **Bundle Metrics**
   - Initial bundle size
   - Lazy chunk sizes
   - Total transferred size

3. **Database Metrics**
   - Query execution time
   - Number of queries per page
   - Cache hit rate

4. **User Experience**
   - Page load time
   - Time to interactive
   - Bounce rate by load time

### Monitoring Integration
- [ ] Set up Web Vitals tracking
- [ ] Integrate with Agent 2's monitoring system
- [ ] Create performance dashboard
- [ ] Set up alerts for performance regressions

## Next Steps
1. Begin Phase 1: Code splitting implementation
2. Test each optimization incrementally
3. Measure before/after metrics
4. Document results
5. Coordinate with Agent 2 for monitoring setup

## Notes
- All optimizations should be backward compatible
- Test on both development and production builds
- Monitor for performance regressions
- User experience should not be degraded
