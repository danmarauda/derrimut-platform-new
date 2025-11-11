/**
 * Lazy-loaded admin components for code splitting
 * This reduces the initial bundle size by loading admin features on demand
 */

import { lazy } from 'react';

// Admin Dashboard Components
// Note: AdminLayout and RoleGuard are named exports, not default exports
// Import them directly instead of using lazy()
export { AdminLayout } from '@/components/AdminLayout';
export { RoleGuard } from '@/components/RoleGuard';

// Heavy UI Components
// RichTextEditor is a named export
export const RichTextEditor = lazy(() => import('@/components/ui/RichTextEditor').then(mod => ({ default: mod.RichTextEditor })));
// LeafletMap is a default export
export const LeafletMap = lazy(() => import('@/components/LeafletMap'));
// InventoryModal is a named export
export const InventoryModal = lazy(() => import('@/components/InventoryModal').then(mod => ({ default: mod.InventoryModal })));

// Admin Feature Pages (lazy load entire page components)
export const AdminSalaryPage = lazy(() => import('@/app/admin/salary/page'));
export const AdminUsersPage = lazy(() => import('@/app/admin/users/page'));
export const AdminMarketplacePage = lazy(() => import('@/app/admin/marketplace/page'));
export const AdminInventoryPage = lazy(() => import('@/app/admin/inventory/page'));
export const AdminBlogPage = lazy(() => import('@/app/admin/blog/page'));

// Loading component for Suspense boundaries
export const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
    <span className="ml-3 text-muted-foreground">Loading...</span>
  </div>
);

// Error boundary fallback
export const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-destructive mb-2">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
      >
        Reload Page
      </button>
    </div>
  </div>
);
