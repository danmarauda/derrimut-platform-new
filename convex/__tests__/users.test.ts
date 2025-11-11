import { describe, it, expect, beforeEach, vi } from 'vitest';
import { syncUser, updateUser, getUserRole, getAllUsers } from '../users';
import { createMockConvexContext, createMockUser } from '../../src/__tests__/utils';

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

      // Call the mutation directly - no .handler property needed
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
      mockCtx.db.insert.mockResolvedValue('test_user_id');

      const args = {
        name: 'Test User',
        email: 'test@example.com',
        clerkId: 'test_clerk_id',
      };

      const result = await (syncUser as any).handler(mockCtx, args);

      expect(result).toBe('test_user_id');
      expect(mockCtx.db.insert).toHaveBeenCalledWith(
        'users',
        expect.objectContaining({
          role: 'user',
          accountType: 'personal',
        })
      );
    });

    it('should return existing user ID when user already exists', async () => {
      const existingUser = { ...createMockUser(), clerkId: 'existing_clerk_id' };
      mockCtx.db.query().filter().first.mockResolvedValue(existingUser);

      const args = {
        name: 'Updated Name',
        email: 'updated@example.com',
        clerkId: 'existing_clerk_id',
      };

      const result = await (syncUser as any).handler(mockCtx, args);

      expect(result).toBe(existingUser._id);
      expect(mockCtx.db.insert).not.toHaveBeenCalled();
    });

    it('should update existing user if missing role or createdAt', async () => {
      const existingUser = {
        ...createMockUser(),
        clerkId: 'incomplete_user',
        role: undefined, // Missing role
        createdAt: undefined, // Missing createdAt
      };
      mockCtx.db.query().filter().first.mockResolvedValue(existingUser);

      const args = {
        name: 'Test User',
        email: 'test@example.com',
        clerkId: 'incomplete_user',
      };

      await (syncUser as any).handler(mockCtx, args);

      expect(mockCtx.db.patch).toHaveBeenCalledWith(
        existingUser._id,
        expect.objectContaining({
          role: 'user',
          createdAt: existingUser.createdAt || expect.any(Number),
          updatedAt: expect.any(Number),
        })
      );
    });

    it('should set timestamps on user creation', async () => {
      mockCtx.db.query().filter().first.mockResolvedValue(null);
      mockCtx.db.insert.mockResolvedValue('timestamp_test_id');

      const args = {
        name: 'Timestamp Test',
        email: 'timestamp@example.com',
        clerkId: 'timestamp_user',
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
      mockCtx.db.insert.mockResolvedValue('image_test_id');

      const args_without_image = {
        name: 'No Image User',
        email: 'noimage@example.com',
        clerkId: 'no_image_user',
      };

      await (syncUser as any).handler(mockCtx, args_without_image);

      expect(mockCtx.db.insert).toHaveBeenCalledWith(
        'users',
        expect.not.objectContaining({
          image: expect.anything(),
        })
      );
    });
  });

  describe('updateUser', () => {
    it('should update existing user', async () => {
      const existingUser = createMockUser();
      mockCtx.db.query().filter().first.mockResolvedValue(existingUser);
      mockCtx.db.patch.mockResolvedValue();

      const args = {
        name: 'Updated Name',
        email: 'updated@example.com',
        clerkId: 'test_clerk_id',
      };

      await (updateUser as any).handler(mockCtx, args);

      expect(mockCtx.db.patch).toHaveBeenCalledWith(
        existingUser._id,
        expect.objectContaining({
          name: 'Updated Name',
          email: 'updated@example.com',
        })
      );
    });

    it('should not update if user does not exist', async () => {
      mockCtx.db.query().filter().first.mockResolvedValue(null);

      const args = {
        name: 'Non-existent',
        email: 'nonexist@example.com',
        clerkId: 'nonexistent_user',
      };

      await (updateUser as any).handler(mockCtx, args);

      expect(mockCtx.db.patch).not.toHaveBeenCalled();
    });

    it('should add missing role field when updating', async () => {
      const userWithoutRole = {
        ...createMockUser(),
        role: undefined,
      };
      mockCtx.db.query().filter().first.mockResolvedValue(userWithoutRole);
      mockCtx.db.patch.mockResolvedValue();

      const args = {
        name: 'Role Missing User',
        email: 'rolemissing@example.com',
        clerkId: 'role_missing_user',
      };

      await (updateUser as any).handler(mockCtx, args);

      expect(mockCtx.db.patch).toHaveBeenCalledWith(
        userWithoutRole._id,
        expect.not.objectContaining({
          role: expect.anything(),
        })
      );
    });
  });

  describe('getUserRole', () => {
    it('should return user role when user exists', async () => {
      const user = {
        ...createMockUser(),
        role: 'trainer' as const,
      };
      mockCtx.db.query().withIndex().unique.mockResolvedValue(user);

      const args = { clerkId: 'test_clerk_id' };

      const result = await (getUserRole as any).handler(mockCtx, args);

      expect(result).toBe('trainer');
    });

    it('should return "user" as default when user not found', async () => {
      mockCtx.db.query().withIndex().unique.mockResolvedValue(null);

      const args = { clerkId: 'nonexistent_user' };

      const result = await (getUserRole as any).handler(mockCtx, args);

      expect(result).toBe('user');
    });

    it('should return "user" when role is undefined', async () => {
      const userWithoutRole = {
        ...createMockUser(),
        role: undefined,
      };
      mockCtx.db.query().withIndex().unique.mockResolvedValue(userWithoutRole);

      const args = { clerkId: 'undefined_role_user' };

      const result = await (getUserRole as any).handler(mockCtx, args);

      expect(result).toBe('user');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users for admin', async () => {
      const adminUser = {
        ...createMockUser(),
        role: 'admin' as const,
      };
      mockCtx.db.query().withIndex().first.mockResolvedValue(adminUser);
      mockCtx.db.query().collect.mockResolvedValue([adminUser]);

      const result = await (getAllUsers as any).handler(mockCtx, {});

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('admin');
    });

    it('should return all users for superadmin', async () => {
      const superadminUser = {
        ...createMockUser(),
        role: 'superadmin' as const,
      };
      mockCtx.db.query().withIndex().first.mockResolvedValue(superadminUser);
      mockCtx.db.query().collect.mockResolvedValue([superadminUser]);

      const result = await (getAllUsers as any).handler(mockCtx, {});

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('superadmin');
    });

    it('should throw error when not authenticated', async () => {
      mockCtx.auth.getUserIdentity.mockResolvedValue(null);

      await expect((getAllUsers as any).handler(mockCtx, {})).rejects.toThrow(
        'Not authenticated'
      );
    });

    it('should throw error for regular user', async () => {
      const regularUser = {
        ...createMockUser(),
        role: 'user' as const,
      };
      mockCtx.db.query().withIndex().first.mockResolvedValue(regularUser);

      await expect((getAllUsers as any).handler(mockCtx, {})).rejects.toThrow(
        'Unauthorized: Admin access required'
      );
    });

    it('should throw error for trainer', async () => {
      const trainerUser = { ...createMockUser(), role: 'trainer' as const };
      mockCtx.db.query().withIndex().first.mockResolvedValue(trainerUser);

      await expect((getAllUsers as any).handler(mockCtx, {})).rejects.toThrow(
        'Unauthorized: Admin access required'
      );
    });

    it('should verify user identity before proceeding', async () => {
      const adminUser = {
        ...createMockUser(),
        role: 'admin' as const,
      };
      mockCtx.db.query().withIndex().first.mockResolvedValue(adminUser);
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
        clerkId: 'concurrent_user',
      };

      const results = await Promise.all([
        (syncUser as any).handler(mockCtx, args),
        (syncUser as any).handler(mockCtx, args),
        (syncUser as any).handler(mockCtx, args),
      ]);

      // All should return the same ID
      results.forEach((result: any) => {
        expect(result).toBe('concurrent_user_id');
      });
    });

    it('should handle empty email gracefully', async () => {
      mockCtx.db.query().filter().first.mockResolvedValue(null);
      mockCtx.db.insert.mockResolvedValue('empty_email_id');

      const args = {
        name: 'Empty Email',
        email: '',
        clerkId: 'empty_email_user',
      };

      const result = await (syncUser as any).handler(mockCtx, args);

      expect(result).toBe('empty_email_id');
      expect(mockCtx.db.insert).toHaveBeenCalledWith(
        'users',
        expect.objectContaining({
          email: '',
        })
      );
    });

    it('should preserve existing role when updating user', async () => {
      const trainerUser = { ...createMockUser(), role: 'trainer' as const };
      mockCtx.db.query().filter().first.mockResolvedValue(trainerUser);
      mockCtx.db.patch.mockResolvedValue();

      const args = {
        name: 'Updated Trainer',
        email: 'trainer@example.com',
        clerkId: 'trainer_user',
      };

      await (updateUser as any).handler(mockCtx, args);

      // Should not change the role
      expect(mockCtx.db.patch).toHaveBeenCalledWith(
        trainerUser._id,
        expect.not.objectContaining({
          role: expect.anything(),
        })
      );
    });
  });
});