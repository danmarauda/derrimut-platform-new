"use client";

import dynamic from 'next/dynamic';
import { ComponentLoader } from '@/components/LoadingSpinner';

// Lazy load heavy admin components
export const SalaryManagement = dynamic(
  () => import('./SalaryManagement').then(mod => ({ default: mod.SalaryManagement })),
  {
    loading: () => <ComponentLoader text="Loading salary management..." />,
    ssr: false
  }
);

export const RecipeManager = dynamic(
  () => import('./RecipeManager').then(mod => ({ default: mod.RecipeManager })),
  {
    loading: () => <ComponentLoader text="Loading recipe manager..." />,
    ssr: false
  }
);

export const UserManagement = dynamic(
  () => import('./UserManagement').then(mod => ({ default: mod.UserManagement })),
  {
    loading: () => <ComponentLoader text="Loading user management..." />,
    ssr: false
  }
);

export const MarketplaceManagement = dynamic(
  () => import('./MarketplaceManagement').then(mod => ({ default: mod.MarketplaceManagement })),
  {
    loading: () => <ComponentLoader text="Loading marketplace management..." />,
    ssr: false
  }
);

export const TrainerApplications = dynamic(
  () => import('./TrainerApplications').then(mod => ({ default: mod.TrainerApplications })),
  {
    loading: () => <ComponentLoader text="Loading trainer applications..." />,
    ssr: false
  }
);
