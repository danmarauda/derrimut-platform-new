import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RoleGuard } from '../RoleGuard';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

// Mock Convex
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}));

const mockUseUser = useUser as ReturnType<typeof vi.fn>;
const mockUseQuery = useQuery as ReturnType<typeof vi.fn>;

describe('RoleGuard', () => {
  const TestComponent = () => <div>Protected Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading States', () => {
    it('should show loading state when user is not loaded', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      } as any);
      mockUseQuery.mockReturnValue(undefined);

      render(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should show loading state when role is undefined', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue(undefined);

      render(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show custom fallback when provided during loading', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      } as any);
      mockUseQuery.mockReturnValue(undefined);

      render(
        <RoleGuard allowedRoles={['admin']} fallback={<div>Custom Loading</div>}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Custom Loading')).toBeInTheDocument();
    });
  });

  describe('Access Control - Superadmin', () => {
    it('should allow access for superadmin', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('superadmin');

      render(
        <RoleGuard allowedRoles={['superadmin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });

    it('should allow superadmin to access admin-only content', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('superadmin');

      render(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Access Control - Admin', () => {
    it('should allow access for admin', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('admin');

      render(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should deny admin access to superadmin-only content', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('admin');

      render(
        <RoleGuard allowedRoles={['superadmin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should allow admin access when multiple roles are allowed', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('admin');

      render(
        <RoleGuard allowedRoles={['admin', 'trainer']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Access Control - Trainer', () => {
    it('should allow access for trainer', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('trainer');

      render(
        <RoleGuard allowedRoles={['trainer']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should deny trainer access to admin-only content', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('trainer');

      render(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Access Control - User', () => {
    it('should allow access for regular user', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      render(
        <RoleGuard allowedRoles={['user']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should deny user access to admin content', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      render(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should show helpful message for users with insufficient permissions', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      render(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText(/Consider applying to become a trainer/i)).toBeInTheDocument();
    });
  });

  describe('Access Denied UI', () => {
    it('should display user current role when access is denied', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      render(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText(/Your current role:/i)).toBeInTheDocument();
      expect(screen.getByText(/user/i)).toBeInTheDocument();
    });

    it('should display required roles when access is denied', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      render(
        <RoleGuard allowedRoles={['admin', 'superadmin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText(/Required roles:/i)).toBeInTheDocument();
      expect(screen.getByText(/admin, superadmin/i)).toBeInTheDocument();
    });

    it('should show custom fallback when access is denied', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      render(
        <RoleGuard
          allowedRoles={['admin']}
          fallback={<div>Custom Access Denied</div>}
        >
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Custom Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Roles', () => {
    it('should allow access when user has one of multiple allowed roles', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('trainer');

      render(
        <RoleGuard allowedRoles={['admin', 'trainer', 'superadmin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should allow all roles when all are specified', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      render(
        <RoleGuard allowedRoles={['superadmin', 'admin', 'trainer', 'user']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null role gracefully', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue(null);

      render(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle missing user gracefully', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      } as any);
      mockUseQuery.mockReturnValue('user');

      render(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
