/**
 * Tests for Convex users functions
 * User management and role-based access control tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  syncUser,
  updateUser,
  getUserRole,
  getAllUsers,
} from '../users';
import { createMockConvexContext } from '../../src/__tests__/utils';

describe('Convex Users', () => {
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = createMockConvexContext();
  });

  describe('syncUser', () => {
    it('should create new user when user does not exist', async () => {
      mockCtx.db.query().filter().first.mockResolvedValue(null);
      mockCtx.db.insert.mockResolvedValue('new_user_id');

      const args = {
        name: 'John Doe',
        email: 'john@example.com',
        clerkId: 'clerk_new_user',
        image: 'https://example.com/avatar.jpg',
      };

      const result = await (syncUser as any).handler(mockCtx, args);

      expect(result).toBe('new_user_id');
      expect(mockCtx.db.insert).toHaveBeenCalledWith(
        'users',
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          clerkId: 'clerk_new_user',
          role: 'user',
          accountType: 'personal',
        })
      );
    });

    it('should set default role to "user" for new users', async () => {
      mockCtx.db.query().filter().first.mockResolvedValue(null);
      mockCtx.db.insert.mockResolvedValue('new_user_id');

      const args = {
        name: 'Test User',
        email: 'test@example.com',
        clerkId: 'clerk_test',
      };

      await (syncUser as any).handler(mockCtx, args);

      expect(mockCtx.db.insert).toHaveBeenCalledWith(
        'users',
        expect.objectContaining({
          role: 'user',
        })
      );
    });

    it('should set default accountType to "personal"', async () => {
      mockCtx.db.query().filter().first.mockResolvedValue(null);
      mockCtx.db.insert.mockResolvedValue('new_user_id');

      const args = {
        name: 'Test User',
        email: 'test@example.com',
        clerkId: 'clerk_test',
      };

      await (syncUser as any).handler(mockCtx, args);

      expect(mockCtx.db.insert).toHaveBeenCalledWith(
        'users',
        expect.objectContaining({
          accountType: 'personal',
        })
      );
    });

    it('should return existing user ID when user already exists', async () => {
      const existingUser = {
        _id: 'existing_user_id',
        clerkId: 'clerk_existing',
        role: 'user',
        createdAt: Date.now(),
      };

      mockCtx.db.query().filter().first.mockResolvedValue(existingUser);

      const args = {
        name: 'Existing User',
        email: 'existing@example.com',
        clerkId: 'clerk_existing',
      };

      const result = await (syncUser as any).handler(mockCtx, args);

      expect(result).toBe('existing_user_id');
      expect(mockCtx.db.insert).not.toHaveBeenCalled();
    });

    it('should update existing user if missing role or createdAt', async () => {
      const existingUserWithoutRole = {
        _id: 'user_without_role',
        clerkId: 'clerk_incomplete',
        // Missing role and createdAt
      };

      mockCtx.db.query().filter().first.mockResolvedValue(existingUserWithoutRole);
      mockCtx.db.patch.mockResolvedValue(undefined);

      const args = {
        name: 'Incomplete User',
        email: 'incomplete@example.com',
        clerkId: 'clerk_incomplete',
      };

      await (syncUser as any).handler(mockCtx, args);

      expect(mockCtx.db.patch).toHaveBeenCalledWith(
        'user_without_role',
        expect.objectContaining({
          role: 'user',
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        })
      );
    });

    it('should set timestamps on user creation', async () => {
      mockCtx.db.query().filter().first.mockResolvedValue(null);
      mockCtx.db.insert.mockResolvedValue('new_user_id');

      const args = {
        name: 'Test User',
        email: 'test@example.com',
        clerkId: 'clerk_test',
      };

      await (syncUser as any).handler(mockCtx, args);

      expect(mockCtx.db.insert).toHaveBeenCalledWith(
        'users',
        expect.objectContaining({
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        })
      );
    });

    it('should handle optional image parameter', async () => {
      mockCtx.db.query().filter().first.mockResolvedValue(null);
      mockCtx.db.insert.mockResolvedValue('new_user_id');

      const argsWithoutImage = {
        name: 'Test User',
        email: 'test@example.com',
        clerkId: 'clerk_test',
      };

      await (syncUser as any).handler(mockCtx, argsWithoutImage);

      expect(mockCtx.db.insert).toHaveBeenCalled();

      const argsWithImage = {
        name: 'Test User',
        email: 'test@example.com',
        clerkId: 'clerk_test_with_image',
        image: 'https://example.com/photo.jpg',
      };

      await (syncUser as any).handler(mockCtx, argsWithImage);

      expect(mockCtx.db.insert).toHaveBeenCalledWith(
        'users',
        expect.objectContaining({
          image: 'https://example.com/photo.jpg',
        })
      );
    });
  });

  describe('updateUser', () => {
    it('should update existing user', async () => {
      const existingUser = {
        _id: 'user_to_update',
        clerkId: 'clerk_update_test',
        role: 'user',
        createdAt: Date.now() - 86400000, // 1 day ago
      };

      mockCtx.db.query().withIndex().first.mockResolvedValue(existingUser);
      mockCtx.db.patch.mockResolvedValue(undefined);

      const args = {
        name: 'Updated Name',
        email: 'updated@example.com',
        clerkId: 'clerk_update_test',
        image: 'https://example.com/new-avatar.jpg',
      };

      await (updateUser as any).handler(mockCtx, args);

      expect(mockCtx.db.patch).toHaveBeenCalledWith(
        'user_to_update',
        expect.objectContaining({
          name: 'Updated Name',
          email: 'updated@example.com',
          updatedAt: expect.any(Number),
        })
      );
    });

    it('should not update if user does not exist', async () => {
      mockCtx.db.query().withIndex().first.mockResolvedValue(null);

      const args = {
        name: 'Non-existent User',
        email: 'nonexistent@example.com',
        clerkId: 'clerk_nonexistent',
      };

      const result = await (updateUser as any).handler(mockCtx, args);

      expect(result).toBeUndefined();
      expect(mockCtx.db.patch).not.toHaveBeenCalled();
    });

    it('should add missing role field when updating', async () => {
      const userWithoutRole = {
        _id: 'user_no_role',
        clerkId: 'clerk_no_role',
        createdAt: Date.now(),
      };

      mockCtx.db.query().withIndex().first.mockResolvedValue(userWithoutRole);
      mockCtx.db.patch.mockResolvedValue(undefined);

      const args = {
        name: 'User Without Role',
        email: 'norole@example.com',
        clerkId: 'clerk_no_role',
      };

      await (updateUser as any).handler(mockCtx, args);

      expect(mockCtx.db.patch).toHaveBeenCalledWith(
        'user_no_role',
        expect.objectContaining({
          role: 'user',
        })
      );
    });

    it('should add missing createdAt field when updating', async () => {
      const userWithoutCreatedAt = {
        _id: 'user_no_created',
        clerkId: 'clerk_no_created',
        role: 'user',
      };

      mockCtx.db.query().withIndex().first.mockResolvedValue(userWithoutCreatedAt);
      mockCtx.db.patch.mockResolvedValue(undefined);

      const args = {
        name: 'User Without CreatedAt',
        email: 'nocreated@example.com',
        clerkId: 'clerk_no_created',
      };

      await (updateUser as any).handler(mockCtx, args);

      expect(mockCtx.db.patch).toHaveBeenCalledWith(
        'user_no_created',
        expect.objectContaining({
          createdAt: expect.any(Number),
        })
      );
    });

    it('should update timestamp on every update', async () => {
      const existingUser = {
        _id: 'user_timestamp_test',
        clerkId: 'clerk_timestamp',
        role: 'user',
        createdAt: Date.now(),
      };

      mockCtx.db.query().withIndex().first.mockResolvedValue(existingUser);
      mockCtx.db.patch.mockResolvedValue(undefined);

      const args = {
        name: 'Timestamp Test',
        email: 'timestamp@example.com',
        clerkId: 'clerk_timestamp',
      };

      await (updateUser as any).handler(mockCtx, args);

      expect(mockCtx.db.patch).toHaveBeenCalledWith(
        'user_timestamp_test',
        expect.objectContaining({
          updatedAt: expect.any(Number),
        })
      );
    });
  });

  describe('getUserRole', () => {
    it('should return user role when user exists', async () => {
      const user = {
        _id: 'user_role_test',
        clerkId: 'clerk_role_test',
        role: 'admin',
      };

      mockCtx.db.query().withIndex().first.mockResolvedValue(user);

      const result = await (getUserRole as any).handler(mockCtx, {
        clerkId: 'clerk_role_test',
      });

      expect(result).toBe('admin');
    });

    it('should return "user" as default when user not found', async () => {
      mockCtx.db.query().withIndex().first.mockResolvedValue(null);

      const result = await (getUserRole as any).handler(mockCtx, {
        clerkId: 'clerk_nonexistent',
      });

      expect(result).toBe('user');
    });

    it('should return "user" when role is undefined', async () => {
      const userWithoutRole = {
        _id: 'user_undefined_role',
        clerkId: 'clerk_undefined',
      };

      mockCtx.db.query().withIndex().first.mockResolvedValue(userWithoutRole);

      const result = await (getUserRole as any).handler(mockCtx, {
        clerkId: 'clerk_undefined',
      });

      expect(result).toBe('user');
    });

    it('should handle different role types', async () => {
      const roles = ['user', 'admin', 'superadmin', 'trainer'];

      for (const role of roles) {
        const user = {
          _id: `user_${role}`,
          clerkId: `clerk_${role}`,
          role,
        };

        mockCtx.db.query().withIndex().first.mockResolvedValue(user);

        const result = await (getUserRole as any).handler(mockCtx, {
          clerkId: `clerk_${role}`,
        });

        expect(result).toBe(role);
      }
    });
  });

  describe('getAllUsers', () => {
    it('should return all users for admin', async () => {
      const adminUser = {
        _id: 'admin_user',
        clerkId: 'clerk_admin',
        role: 'admin',
      };

      const allUsers = [
        { _id: 'user_1', name: 'User 1' },
        { _id: 'user_2', name: 'User 2' },
        { _id: 'admin_user', name: 'Admin' },
      ];

      mockCtx.auth.getUserIdentity.mockResolvedValue({
        subject: 'clerk_admin',
      });

      mockCtx.db.query().withIndex().first.mockResolvedValue(adminUser);
      mockCtx.db.query().collect.mockResolvedValue(allUsers);

      const result = await (getAllUsers as any).handler(mockCtx, {});

      expect(result).toEqual(allUsers);
      expect(result.length).toBe(3);
    });

    it('should return all users for superadmin', async () => {
      const superadminUser = {
        _id: 'superadmin_user',
        clerkId: 'clerk_superadmin',
        role: 'superadmin',
      };

      const allUsers = [
        { _id: 'user_1', name: 'User 1' },
        { _id: 'superadmin_user', name: 'Superadmin' },
      ];

      mockCtx.auth.getUserIdentity.mockResolvedValue({
        subject: 'clerk_superadmin',
      });

      mockCtx.db.query().withIndex().first.mockResolvedValue(superadminUser);
      mockCtx.db.query().collect.mockResolvedValue(allUsers);

      const result = await (getAllUsers as any).handler(mockCtx, {});

      expect(result).toEqual(allUsers);
    });

    it('should throw error when not authenticated', async () => {
      mockCtx.auth.getUserIdentity.mockResolvedValue(null);

      await expect((getAllUsers as any).handler(mockCtx, {})).rejects.toThrow(
        'Not authenticated'
      );
    });

    it('should throw error for regular user', async () => {
      const regularUser = {
        _id: 'regular_user',
        clerkId: 'clerk_user',
        role: 'user',
      };

      mockCtx.auth.getUserIdentity.mockResolvedValue({
        subject: 'clerk_user',
      });

      mockCtx.db.query().withIndex().first.mockResolvedValue(regularUser);

      await expect((getAllUsers as any).handler(mockCtx, {})).rejects.toThrow(
        'Unauthorized: Admin access required'
      );
    });

    it('should throw error for trainer', async () => {
      const trainerUser = {
        _id: 'trainer_user',
        clerkId: 'clerk_trainer',
        role: 'trainer',
      };

      mockCtx.auth.getUserIdentity.mockResolvedValue({
        subject: 'clerk_trainer',
      });

      mockCtx.db.query().withIndex().first.mockResolvedValue(trainerUser);

      await expect((getAllUsers as any).handler(mockCtx, {})).rejects.toThrow(
        'Unauthorized: Admin access required'
      );
    });

    it('should verify user identity before proceeding', async () => {
      mockCtx.auth.getUserIdentity.mockResolvedValue({
        subject: 'clerk_test',
      });

      mockCtx.db.query().withIndex().first.mockResolvedValue({
        role: 'admin',
      });

      mockCtx.db.query().collect.mockResolvedValue([]);

      await (getAllUsers as any).handler(mockCtx, {});

      expect(mockCtx.auth.getUserIdentity).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent syncUser calls', async () => {
      mockCtx.db.query().filter().first.mockResolvedValue(null);
      mockCtx.db.insert.mockResolvedValue('concurrent_user_id');

      const args = {
        name: 'Concurrent User',
        email: 'concurrent@example.com',
        clerkId: 'clerk_concurrent',
      };

      await Promise.all([
        (syncUser as any).handler(mockCtx, args),
        (syncUser as any).handler(mockCtx, args),
        (syncUser as any).handler(mockCtx, args),
      ]);

      expect(mockCtx.db.insert).toHaveBeenCalled();
    });

    it('should handle empty email gracefully', async () => {
      mockCtx.db.query().filter().first.mockResolvedValue(null);
      mockCtx.db.insert.mockResolvedValue('user_empty_email');

      const args = {
        name: 'User Without Email',
        email: '',
        clerkId: 'clerk_no_email',
      };

      const result = await (syncUser as any).handler(mockCtx, args);

      expect(result).toBeDefined();
    });

    it('should preserve existing role when updating user', async () => {
      const existingAdminUser = {
        _id: 'existing_admin',
        clerkId: 'clerk_admin_preserve',
        role: 'admin',
        createdAt: Date.now(),
      };

      mockCtx.db.query().withIndex().first.mockResolvedValue(existingAdminUser);
      mockCtx.db.patch.mockResolvedValue(undefined);

      const args = {
        name: 'Admin Updated',
        email: 'admin@example.com',
        clerkId: 'clerk_admin_preserve',
      };

      await (updateUser as any).handler(mockCtx, args);

      // Should not override existing role
      const patchCall = mockCtx.db.patch.mock.calls[0][1];
      expect(patchCall.role).toBeUndefined();
    });
  });
});
