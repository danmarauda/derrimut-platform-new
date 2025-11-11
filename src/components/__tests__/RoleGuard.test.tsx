import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import RoleGuard from '../RoleGuard';
import { renderWithProviders, mockUseUser, mockUseQuery } from '../__tests__/utils';

// Mock the hooks
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}));

// Import after mocking
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';

const { useUser: mockUseUserHook } = vi.mocked('@clerk/nextjs');
const { useQuery: mockUseQueryHook } = vi.mocked('convex/react');

describe('RoleGuard', () => {
  let mockUser: ReturnType<typeof mockUseUser>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = mockUseUser();
    mockUseQueryHook.mockReturnValue('user');
  });

  const TestComponent = () => <div>Protected Content</div>;

  describe('Loading States', () => {
    it('should show loading state when user is not loaded', () => {
      mockUseUserHook.mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      } as any);

      renderWithProviders(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should show loading state when role is undefined', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue(undefined);

      renderWithProviders(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should show custom fallback when provided during loading', () => {
      mockUseUserHook.mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      } as any);

      renderWithProviders(
        <RoleGuard allowedRoles={['admin']} fallback={<div>Custom Loading</div>}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Custom Loading')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('Access Control - Superadmin', () => {
    it('should allow access for superadmin', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'superadmin123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('superadmin');

      renderWithProviders(
        <RoleGuard allowedRoles={['superadmin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should allow superadmin to access admin-only content', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('superadmin');

      renderWithProviders(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should allow superadmin to access all role levels', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('superadmin');

      renderWithProviders(
        <RoleGuard allowedRoles={['admin', 'trainer', 'user']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Access Control - Admin', () => {
    it('should allow access for admin', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'admin123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('admin');

      renderWithProviders(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should deny admin access to superadmin-only content', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'admin123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('admin');

      renderWithProviders(
        <RoleGuard allowedRoles={['superadmin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should allow admin access when multiple roles are allowed', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'admin123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('admin');

      renderWithProviders(
        <RoleGuard allowedRoles={['admin', 'trainer']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Access Control - Trainer', () => {
    it('should allow access for trainer', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'trainer123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('trainer');

      renderWithProviders(
        <RoleGuard allowedRoles={['trainer']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should deny trainer access to admin-only content', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'trainer123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('trainer');

      renderWithProviders(
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
      mockUseUserHook.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('user');

      renderWithProviders(
        <RoleGuard allowedRoles={['user']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should deny user access to admin content', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('user');

      renderWithProviders(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Error Messages', () => {
    it('should show helpful message for users with insufficient permissions', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('user');

      renderWithProviders(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText(/Consider applying to become a trainer/)).toBeInTheDocument();
    });

    it('should display user current role when access is denied', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('trainer');

      renderWithProviders(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Your current role: trainer')).toBeInTheDocument();
    });

    it('should display required roles when access is denied', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('user');

      renderWithProviders(
        <RoleGuard allowedRoles={['admin', 'trainer']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Required roles: admin, trainer')).toBeInTheDocument();
    });

    it('should show custom fallback when access is denied', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('user');

      renderWithProviders(
        <RoleGuard allowedRoles={['admin']} fallback={<div>Custom Denied</div>}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Custom Denied')).toBeInTheDocument();
      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });
  });

  describe('Role Hierarchy', () => {
    it('should allow access when user has one of multiple allowed roles', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('trainer');

      renderWithProviders(
        <RoleGuard allowedRoles={['admin', 'trainer', 'user']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should allow all roles when all are specified', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue('user');

      renderWithProviders(
        <RoleGuard allowedRoles={['superadmin', 'admin', 'trainer', 'user']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null role gracefully', () => {
      mockUseUserHook.mockReturnValue({
        user: { id: 'user123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQueryHook.mockReturnValue(null);

      renderWithProviders(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle missing user gracefully', () => {
      mockUseUserHook.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      } as any);
      mockUseQueryHook.mockReturnValue('admin');

      renderWithProviders(
        <RoleGuard allowedRoles={['admin']}>
          <TestComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});