/**
 * Tests for Convex memberships functions
 * Critical membership management logic tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  getMembershipPlans,
  getUserMembership,
  getMembershipBySubscription,
  upsertMembership,
} from '../memberships';
import { createMockConvexContext } from '../../src/__tests__/utils';

describe('Convex Memberships', () => {
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = createMockConvexContext();
  });

  describe('getMembershipPlans', () => {
    it('should return all active membership plans', async () => {
      const mockPlans = [
        {
          _id: 'plan_1',
          name: 'No Lock-In',
          stripePriceId: 'price_1',
          amount: 99,
          isActive: true,
          sortOrder: 1,
        },
        {
          _id: 'plan_2',
          name: '12-Month',
          stripePriceId: 'price_2',
          amount: 79,
          isActive: true,
          sortOrder: 2,
        },
      ];

      mockCtx.db.query().withIndex().order().collect.mockResolvedValue(mockPlans);

      const result = await (getMembershipPlans as any).handler(mockCtx, {});

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].sortOrder).toBeLessThanOrEqual(result[1].sortOrder);
    });

    it('should return plans sorted by sortOrder', async () => {
      const mockPlans = [
        {
          _id: 'plan_3',
          name: 'Premium',
          stripePriceId: 'price_3',
          amount: 120,
          isActive: true,
          sortOrder: 3,
        },
        {
          _id: 'plan_1',
          name: 'Basic',
          stripePriceId: 'price_1',
          amount: 60,
          isActive: true,
          sortOrder: 1,
        },
        {
          _id: 'plan_2',
          name: 'Standard',
          stripePriceId: 'price_2',
          amount: 90,
          isActive: true,
          sortOrder: 2,
        },
      ];

      mockCtx.db.query().withIndex().order().collect.mockResolvedValue(mockPlans);

      const result = await (getMembershipPlans as any).handler(mockCtx, {});

      expect(result[0].sortOrder).toBe(1);
      expect(result[1].sortOrder).toBe(2);
      expect(result[2].sortOrder).toBe(3);
    });

    it('should only return active plans', async () => {
      const mockQuery = {
        withIndex: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        collect: jest.fn().mockResolvedValue([] as unknown as never),
      };

      mockCtx.db.query.mockReturnValue(mockQuery);

      await (getMembershipPlans as any).handler(mockCtx, {});

      expect(mockQuery.withIndex).toHaveBeenCalledWith(
        'by_active',
        expect.any(Function)
      );
    });
  });

  describe('getUserMembership', () => {
    it('should return active membership for user', async () => {
      const mockMembership = {
        _id: 'membership_1',
        userId: 'user_123',
        clerkId: 'clerk_123',
        membershipType: 'no-lock-in',
        status: 'active',
        stripeSubscriptionId: 'sub_123',
      };

      mockCtx.db.query().withIndex().filter().first.mockResolvedValue(mockMembership);

      const result = await (getUserMembership as any).handler(mockCtx, {
        clerkId: 'clerk_123',
      });

      expect(result).toEqual(mockMembership);
      expect(result?.status).toBe('active');
    });

    it('should return null when user has no active membership', async () => {
      mockCtx.db.query().withIndex().filter().first.mockResolvedValue(null);

      const result = await (getUserMembership as any).handler(mockCtx, {
        clerkId: 'clerk_456',
      });

      expect(result).toBeNull();
    });

    it('should filter by clerkId correctly', async () => {
      const mockQuery = {
        withIndex: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null as unknown as never),
      };

      mockCtx.db.query.mockReturnValue(mockQuery);

      await (getUserMembership as any).handler(mockCtx, {
        clerkId: 'test_clerk_id',
      });

      expect(mockQuery.withIndex).toHaveBeenCalledWith(
        'by_clerk_id',
        expect.any(Function)
      );
    });
  });

  describe('getMembershipBySubscription', () => {
    it('should return membership by subscription ID', async () => {
      const mockMembership = {
        _id: 'membership_1',
        stripeSubscriptionId: 'sub_test_123',
        status: 'active',
      };

      mockCtx.db.query().withIndex().first.mockResolvedValue(mockMembership);

      const result = await (getMembershipBySubscription as any).handler(mockCtx, {
        subscriptionId: 'sub_test_123',
      });

      expect(result).toEqual(mockMembership);
    });

    it('should return null when subscription not found', async () => {
      mockCtx.db.query().withIndex().first.mockResolvedValue(null);

      const result = await (getMembershipBySubscription as any).handler(mockCtx, {
        subscriptionId: 'sub_nonexistent',
      });

      expect(result).toBeNull();
    });

    it('should query by subscription index', async () => {
      const mockQuery = {
        withIndex: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null as unknown as never),
      };

      mockCtx.db.query.mockReturnValue(mockQuery);

      await (getMembershipBySubscription as any).handler(mockCtx, {
        subscriptionId: 'sub_123',
      });

      expect(mockQuery.withIndex).toHaveBeenCalledWith(
        'by_subscription',
        expect.any(Function)
      );
    });
  });

  describe('upsertMembership', () => {
    it('should create new membership when subscription does not exist', async () => {
      mockCtx.db.query().withIndex().first.mockResolvedValue(null);
      mockCtx.db.query().withIndex().filter().collect.mockResolvedValue([]);
      mockCtx.db.insert.mockResolvedValue('new_membership_id');

      const args = {
        userId: 'user_123' as any,
        clerkId: 'clerk_123',
        membershipType: 'no-lock-in' as const,
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_new_123',
        stripePriceId: 'price_123',
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      const result = await (upsertMembership as any).handler(mockCtx, args);

      expect(result).toBe('new_membership_id');
      expect(mockCtx.db.insert).toHaveBeenCalled();
    });

    it('should update existing membership when subscription exists', async () => {
      const existingMembership = {
        _id: 'existing_membership_id',
        stripeSubscriptionId: 'sub_existing_123',
        status: 'active',
      };

      mockCtx.db.query().withIndex().first.mockResolvedValue(existingMembership);
      mockCtx.db.patch.mockResolvedValue(undefined);

      const args = {
        userId: 'user_123' as any,
        clerkId: 'clerk_123',
        membershipType: '12-month-minimum' as const,
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_existing_123',
        stripePriceId: 'price_123',
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + 365 * 24 * 60 * 60 * 1000,
      };

      const result = await (upsertMembership as any).handler(mockCtx, args);

      expect(result).toBe('existing_membership_id');
      expect(mockCtx.db.patch).toHaveBeenCalledWith(
        'existing_membership_id',
        expect.objectContaining({
          membershipType: '12-month-minimum',
          status: 'active',
        })
      );
    });

    it('should cancel existing active memberships when creating new one', async () => {
      const existingActiveMemberships = [
        { _id: 'old_membership_1', status: 'active' },
        { _id: 'old_membership_2', status: 'active' },
      ];

      // Mock sequence: first query returns null (no subscription match)
      // Second query returns existing active memberships
      mockCtx.db.query()
        .withIndex()
        .first.mockResolvedValueOnce(null);

      mockCtx.db.query()
        .withIndex()
        .filter()
        .collect.mockResolvedValue(existingActiveMemberships);

      mockCtx.db.insert.mockResolvedValue('new_membership_id');
      mockCtx.db.patch.mockResolvedValue(undefined);

      const args = {
        userId: 'user_123' as any,
        clerkId: 'clerk_123',
        membershipType: 'no-lock-in' as const,
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_new_456',
        stripePriceId: 'price_123',
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      await (upsertMembership as any).handler(mockCtx, args);

      // Should patch old memberships to cancelled
      expect(mockCtx.db.patch).toHaveBeenCalledTimes(2);
    });

    it('should handle different membership types', async () => {
      mockCtx.db.query().withIndex().first.mockResolvedValue(null);
      mockCtx.db.query().withIndex().filter().collect.mockResolvedValue([]);
      mockCtx.db.insert.mockResolvedValue('new_id');

      const membershipTypes = [
        '18-month-minimum',
        '12-month-minimum',
        'no-lock-in',
        '12-month-upfront',
      ] as const;

      for (const type of membershipTypes) {
        const args = {
          userId: 'user_123' as any,
          clerkId: 'clerk_123',
          membershipType: type,
          stripeCustomerId: 'cus_123',
          stripeSubscriptionId: `sub_${type}`,
          stripePriceId: 'price_123',
          currentPeriodStart: Date.now(),
          currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
        };

        await (upsertMembership as any).handler(mockCtx, args);
      }

      expect(mockCtx.db.insert).toHaveBeenCalledTimes(4);
    });

    it('should set cancelAtPeriodEnd to false when updating', async () => {
      const existingMembership = {
        _id: 'existing_id',
        stripeSubscriptionId: 'sub_123',
        cancelAtPeriodEnd: true,
      };

      mockCtx.db.query().withIndex().first.mockResolvedValue(existingMembership);

      const args = {
        userId: 'user_123' as any,
        clerkId: 'clerk_123',
        membershipType: 'no-lock-in' as const,
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
        stripePriceId: 'price_123',
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      await (upsertMembership as any).handler(mockCtx, args);

      expect(mockCtx.db.patch).toHaveBeenCalledWith(
        'existing_id',
        expect.objectContaining({
          cancelAtPeriodEnd: false,
        })
      );
    });

    it('should update timestamps on upsert', async () => {
      const existingMembership = {
        _id: 'existing_id',
        stripeSubscriptionId: 'sub_123',
      };

      mockCtx.db.query().withIndex().first.mockResolvedValue(existingMembership);

      const args = {
        userId: 'user_123' as any,
        clerkId: 'clerk_123',
        membershipType: 'no-lock-in' as const,
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
        stripePriceId: 'price_123',
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      await (upsertMembership as any).handler(mockCtx, args);

      expect(mockCtx.db.patch).toHaveBeenCalledWith(
        'existing_id',
        expect.objectContaining({
          updatedAt: expect.any(Number),
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent upsert operations', async () => {
      mockCtx.db.query().withIndex().first.mockResolvedValue(null);
      mockCtx.db.query().withIndex().filter().collect.mockResolvedValue([]);
      mockCtx.db.insert.mockResolvedValue('new_id');

      const args = {
        userId: 'user_123' as any,
        clerkId: 'clerk_123',
        membershipType: 'no-lock-in' as const,
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_concurrent',
        stripePriceId: 'price_123',
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      // Simulate concurrent calls
      await Promise.all([
        (upsertMembership as any).handler(mockCtx, args),
        (upsertMembership as any).handler(mockCtx, args),
        (upsertMembership as any).handler(mockCtx, args),
      ]);

      // All should complete without errors
      expect(mockCtx.db.insert).toHaveBeenCalled();
    });

    it('should handle period dates correctly', async () => {
      mockCtx.db.query().withIndex().first.mockResolvedValue(null);
      mockCtx.db.query().withIndex().filter().collect.mockResolvedValue([]);
      mockCtx.db.insert.mockResolvedValue('new_id');

      const now = Date.now();
      const oneMonthLater = now + 30 * 24 * 60 * 60 * 1000;

      const args = {
        userId: 'user_123' as any,
        clerkId: 'clerk_123',
        membershipType: 'no-lock-in' as const,
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_period_test',
        stripePriceId: 'price_123',
        currentPeriodStart: now,
        currentPeriodEnd: oneMonthLater,
      };

      await (upsertMembership as any).handler(mockCtx, args);

      expect(mockCtx.db.insert).toHaveBeenCalledWith(
        'memberships',
        expect.objectContaining({
          currentPeriodStart: now,
          currentPeriodEnd: oneMonthLater,
        })
      );
    });
  });
});
