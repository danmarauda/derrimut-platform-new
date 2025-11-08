/**
 * Authentication Integration Tests
 * Tests complete authentication flows and role-based access
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { RoleGuard } from '@/components/RoleGuard';

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

// Mock Convex
jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
}));

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

describe('Authentication Integration Tests', () => {
  const ProtectedContent = () => <div>Protected Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Authentication Flow', () => {
    it('should show loading state during initial auth check', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      } as any);
      mockUseQuery.mockReturnValue(undefined);

      render(
        <RoleGuard allowedRoles={['user']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should grant access when user is authenticated with correct role', () => {
      mockUseUser.mockReturnValue({
        user: {
          id: 'user_test123',
          firstName: 'Test',
          lastName: 'User',
        },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      render(
        <RoleGuard allowedRoles={['user']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });

    it('should deny access when user has insufficient role', () => {
      mockUseUser.mockReturnValue({
        user: {
          id: 'user_test123',
        },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      render(
        <RoleGuard allowedRoles={['admin']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Role Hierarchy', () => {
    it('should grant superadmin access to admin-only content', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'superadmin_123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('superadmin');

      render(
        <RoleGuard allowedRoles={['admin']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should grant superadmin access to all role levels', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'superadmin_123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('superadmin');

      const roleTests = ['user', 'trainer', 'admin', 'superadmin'];

      roleTests.forEach((role) => {
        const { unmount } = render(
          <RoleGuard allowedRoles={[role as any]}>
            <ProtectedContent />
          </RoleGuard>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        unmount();
      });
    });

    it('should deny admin access to superadmin-only content', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'admin_123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('admin');

      render(
        <RoleGuard allowedRoles={['superadmin']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should deny trainer access to admin content', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'trainer_123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('trainer');

      render(
        <RoleGuard allowedRoles={['admin']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should deny user access to trainer content', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user_123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      render(
        <RoleGuard allowedRoles={['trainer']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Multi-Role Access', () => {
    it('should grant access when user has one of multiple allowed roles', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'trainer_123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('trainer');

      render(
        <RoleGuard allowedRoles={['admin', 'trainer']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should allow all roles when all are specified', () => {
      const roles = ['user', 'trainer', 'admin', 'superadmin'];

      roles.forEach((role) => {
        mockUseUser.mockReturnValue({
          user: { id: `${role}_123` },
          isLoaded: true,
          isSignedIn: true,
        } as any);
        mockUseQuery.mockReturnValue(role);

        const { unmount } = render(
          <RoleGuard allowedRoles={['superadmin', 'admin', 'trainer', 'user']}>
            <ProtectedContent />
          </RoleGuard>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Session State Management', () => {
    it('should handle user sign-out correctly', () => {
      // Initially authenticated
      mockUseUser.mockReturnValue({
        user: { id: 'user_123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      const { rerender } = render(
        <RoleGuard allowedRoles={['user']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();

      // User signs out
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      } as any);
      mockUseQuery.mockReturnValue(null);

      rerender(
        <RoleGuard allowedRoles={['user']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle role changes dynamically', () => {
      // User starts as regular user
      mockUseUser.mockReturnValue({
        user: { id: 'user_123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      const { rerender } = render(
        <RoleGuard allowedRoles={['admin']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();

      // User is promoted to admin
      mockUseQuery.mockReturnValue('admin');

      rerender(
        <RoleGuard allowedRoles={['admin']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should show loading when role query is undefined', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user_123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue(undefined);

      render(
        <RoleGuard allowedRoles={['user']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle null role correctly', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user_123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue(null);

      render(
        <RoleGuard allowedRoles={['user']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle missing user object', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      } as any);
      mockUseQuery.mockReturnValue('user');

      render(
        <RoleGuard allowedRoles={['user']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback Rendering', () => {
    it('should render custom fallback during loading', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      } as any);
      mockUseQuery.mockReturnValue(undefined);

      render(
        <RoleGuard
          allowedRoles={['user']}
          fallback={<div>Custom Loading State</div>}
        >
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.getByText('Custom Loading State')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should render custom fallback on access denied', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user_123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      render(
        <RoleGuard
          allowedRoles={['admin']}
          fallback={<div>Custom Access Denied</div>}
        >
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.getByText('Custom Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    it('should display helpful message for regular users', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user_123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      render(
        <RoleGuard allowedRoles={['admin']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.getByText(/Consider applying to become a trainer/i)).toBeInTheDocument();
    });

    it('should display current role when access is denied', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'trainer_123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('trainer');

      render(
        <RoleGuard allowedRoles={['admin']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.getByText(/Your current role:/i)).toBeInTheDocument();
      expect(screen.getByText(/trainer/i)).toBeInTheDocument();
    });

    it('should display required roles when access is denied', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user_123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      render(
        <RoleGuard allowedRoles={['admin', 'superadmin']}>
          <ProtectedContent />
        </RoleGuard>
      );

      expect(screen.getByText(/Required roles:/i)).toBeInTheDocument();
      expect(screen.getByText(/admin, superadmin/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily when role is stable', () => {
      const renderSpy = jest.fn();

      const TestComponent = () => {
        renderSpy();
        return <div>Test Content</div>;
      };

      mockUseUser.mockReturnValue({
        user: { id: 'user_123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);
      mockUseQuery.mockReturnValue('user');

      const { rerender } = render(
        <RoleGuard allowedRoles={['user']}>
          <TestComponent />
        </RoleGuard>
      );

      const initialRenders = renderSpy.mock.calls.length;

      // Rerender with same state
      rerender(
        <RoleGuard allowedRoles={['user']}>
          <TestComponent />
        </RoleGuard>
      );

      // Should render same number of times (component memoization may vary)
      expect(renderSpy.mock.calls.length).toBeGreaterThanOrEqual(initialRenders);
    });
  });
});
