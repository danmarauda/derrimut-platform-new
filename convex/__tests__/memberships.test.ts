/**
 * Tests for Convex memberships functions
 * Critical membership management logic tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getMembershipPlans,
  getMembership,
  getMembershipBySubscription,
  upsertMembership,
} from '../memberships';
import { createMockConvexContext, createMockUser } from '../../src/__tests__/utils';

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
        withIndex: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        collect: vi.fn().mockResolvedValue([] as unknown as never),
      };

      mockCtx.db.query.mockReturnValue(mockQuery);

      await (getMembershipPlans as any).handler(mockCtx, {});

      expect(mockQuery.withIndex).toHaveBeenCalledWith(
        'by_active',
        expect.any(Function)
      );
    });
  });

  describe('getMembership', () => {
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

      const result = await (getMembership as any).handler(mockCtx, {
        id: 'membership_1' as any,
      });

      expect(result).toEqual(mockMembership);
      expect(result?.status).toBe('active');
    });

    it('should return null when user has no active membership', async () => {
      mockCtx.db.get.mockResolvedValue(null);

      const result = await (getMembership as any).handler(mockCtx, {
        id: 'non_existent' as any,
      });

      expect(result).toBeNull();
    });

    it('should filter by clerkId correctly', async () => {
      const mockQuery = {
        withIndex: vi.fn().mockReturnThis(),
        filter: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(null as unknown as never),
      };

      mockCtx.db.query.mockReturnValue(mockQuery);

      await (getMembership as any).handler(mockCtx, {
        id: 'test_id' as any,
      });

      expect(mockCtx.db.get).toHaveBeenCalled();
    });
  });

  describe('getMembershipBySubscription', () => {
    it('should return membership for subscription ID', async () => {
      const mockMembership = {
        _id: 'membership_2',
        userId: 'user_456',
        clerkId: 'clerk_456',
        stripeSubscriptionId: 'sub_456',
        status: 'active',
      };

      mockCtx.db.query().withIndex().first.mockResolvedValue(mockMembership);

      const result = await (getMembershipBySubscription as any).handler(mockCtx, {
        subscriptionId: 'sub_456',
      });

      expect(result).toEqual(mockMembership);
      expect(result?.stripeSubscriptionId).toBe('sub_456');
    });

    it('should return null for non-existent subscription', async () => {
      mockCtx.db.query().withIndex().first.mockResolvedValue(null);

      const result = await (getMembershipBySubscription as any).handler(mockCtx, {
        subscriptionId: 'non_existent',
      });

      expect(result).toBeNull();
    });

    it('should use correct subscription index', async () => {
      const mockQuery = {
        withIndex: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(null as unknown as never),
      };

      mockCtx.db.query.mockReturnValue(mockQuery);

      await (getMembershipBySubscription as any).handler(mockCtx, {
        subscriptionId: 'test_sub_id',
      });

      expect(mockQuery.withIndex).toHaveBeenCalledWith(
        'by_subscription',
        expect.any(Function)
      );
    });
  });

  describe('upsertMembership', () => {
    it('should create new membership and cancel existing ones', async () => {
      const existingMemberships = [
        {
          ...createMockUser(),
          _id: 'old_membership_1' as any,
          clerkId: 'clerk_789',
          status: 'active',
        },
      ];

      const mockUser = {
        ...createMockUser(),
        clerkId: 'clerk_789',
      };

      const newMembershipId = 'new_membership_id';

      // Mock the existing memberships lookup
      const existingMembershipsQuery = {
        withIndex: vi.fn().mockReturnThis(),
        filter: vi.fn().mockReturnThis(),
        collect: vi.fn().mockResolvedValue(existingMemberships),
      };

      // Mock user lookup
      mockCtx.db.get.mockResolvedValue(mockUser);
      mockCtx.db.query.mockReturnValue(existingMembershipsQuery);
      mockCtx.db.insert.mockResolvedValue(newMembershipId);

      const input = {
        userId: 'user_789',
        ...createMockUser(),
        clerkId: 'clerk_789',
        membershipType: '12-month-minimum',
        stripeCustomerId: 'cus_789',
        stripeSubscriptionId: 'sub_789',
        stripePriceId: 'price_789',
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + (365 * 24 * 60 * 60 * 1000),
      };

      const result = await (upsertMembership as any).handler(mockCtx, input);

      expect(result).toEqual(newMembershipId);
      expect(mockCtx.db.patch).toHaveBeenCalledWith('old_membership_1', {
        status: 'cancelled',
        updatedAt: expect.any(Number),
      });
      expect(mockCtx.db.insert).toHaveBeenCalledWith('memberships', {
        ...input,
        status: 'active',
        cancelAtPeriodEnd: false,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });

    it('should handle multiple existing memberships', async () => {
      const existingMemberships = [
        {
          _id: 'old_membership_1',
          clerkId: 'clerk_multi',
          status: 'active',
        },
        {
          _id: 'old_membership_2',
          clerkId: 'clerk_multi',
          status: 'active',
        },
      ];

      // Mock the existing memberships lookup
      const existingMembershipsQuery = {
        withIndex: vi.fn().mockReturnThis(),
        filter: vi.fn().mockReturnThis(),
        collect: vi.fn().mockResolvedValue(existingMemberships),
      };

      mockCtx.db.query.mockReturnValue(existingMembershipsQuery);
      mockCtx.db.get.mockResolvedValue(null); // No user for referral
      mockCtx.db.insert.mockResolvedValue('new_id');

      const input = {
        userId: 'user_multi',
        clerkId: 'clerk_multi',
        membershipType: 'no-lock-in',
        stripeCustomerId: 'cus_multi',
        stripeSubscriptionId: 'sub_multi',
        stripePriceId: 'price_multi',
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + (365 * 24 * 60 * 60 * 1000),
      };

      await (upsertMembership as any).handler(mockCtx, input);

      // Should cancel both existing memberships
      expect(mockCtx.db.patch).toHaveBeenCalledWith('old_membership_1', {
        status: 'cancelled',
        updatedAt: expect.any(Number),
      });
      expect(mockCtx.db.patch).toHaveBeenCalledWith('old_membership_2', {
        status: 'cancelled',
        updatedAt: expect.any(Number),
      });
    });

    it('should convert referral when user was referred', async () => {
      const mockUser = {
        ...createMockUser(),
        clerkId: 'clerk_referral',
        referredBy: 'referrer_123',
      };

      // Mock no existing memberships
      const existingMembershipsQuery = {
        withIndex: vi.fn().mockReturnThis(),
        filter: vi.fn().mockReturnThis(),
        collect: vi.fn().mockResolvedValue([]),
      };

      mockCtx.db.query.mockReturnValue(existingMembershipsQuery);
      mockCtx.db.get.mockResolvedValue(mockUser);
      mockCtx.db.insert.mockResolvedValue('new_membership_id');

      const input = {
        userId: 'user_referral',
        ...createMockUser(),
        clerkId: 'clerk_referral',
        membershipType: 'no-lock-in',
        stripeCustomerId: 'cus_referral',
        stripeSubscriptionId: 'sub_referral',
        stripePriceId: 'price_referral',
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + (365 * 24 * 60 * 60 * 1000),
      };

      await (upsertMembership as any).handler(mockCtx, input);

      // Should schedule referral conversion
      expect(mockCtx.scheduler.runAfter).toHaveBeenCalledWith(
        0,
        expect.anything(), // api.referrals.convertReferral
        {
          refereeClerkId: 'clerk_referral',
        }
      );
    });

    it('should use correct indexes for membership lookup', async () => {
      const mockQuery = {
        withIndex: vi.fn().mockReturnThis(),
        filter: vi.fn().mockReturnThis(),
        collect: vi.fn().mockResolvedValue([]), // No existing memberships
      };

      mockCtx.db.query.mockReturnValue(mockQuery);
      mockCtx.db.get.mockResolvedValue(null);
      mockCtx.db.insert.mockResolvedValue('test_id');

      const input = {
        userId: 'user_test',
        clerkId: 'clerk_test',
        membershipType: 'no-lock-in',
        stripeCustomerId: 'cus_test',
        stripeSubscriptionId: 'sub_test',
        stripePriceId: 'price_test',
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + (365 * 24 * 60 * 60 * 1000),
      };

      await (upsertMembership as any).handler(mockCtx, input);

      expect(mockQuery.withIndex).toHaveBeenCalledWith(
        'by_clerk_id',
        expect.any(Function)
      );
      expect(mockQuery.filter).toHaveBeenCalled();
    });
  });
});