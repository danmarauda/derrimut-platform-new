import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Groups & Communities System
 * Members can create and join groups based on location, interest, or goals
 */

// Create a group
export const createGroup = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("location"),
      v.literal("interest"),
      v.literal("goal"),
      v.literal("general")
    ),
    locationId: v.optional(v.id("organizations")),
    interest: v.optional(v.string()),
    goal: v.optional(v.string()),
    isPublic: v.boolean(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      description: args.description,
      creatorId: user._id,
      creatorClerkId: identity.subject,
      locationId: args.locationId,
      category: args.category,
      interest: args.interest,
      goal: args.goal,
      isPublic: args.isPublic,
      image: args.image,
      memberCount: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add creator as admin
    await ctx.db.insert("groupMembers", {
      groupId,
      userId: user._id,
      clerkId: identity.subject,
      role: "admin",
      joinedAt: Date.now(),
    });

    return groupId;
  },
});

// Join a group
export const joinGroup = mutation({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Check if already a member
    const existing = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .first();

    if (existing) {
      throw new Error("Already a member of this group");
    }

    // Add as member
    await ctx.db.insert("groupMembers", {
      groupId: args.groupId,
      userId: user._id,
      clerkId: identity.subject,
      role: "member",
      joinedAt: Date.now(),
    });

    // Update member count
    await ctx.db.patch(args.groupId, {
      memberCount: group.memberCount + 1,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Leave a group
export const leaveGroup = mutation({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this group");
    }

    // Don't allow admins to leave (they must transfer admin or delete group)
    if (membership.role === "admin") {
      throw new Error("Admins cannot leave. Transfer admin or delete group.");
    }

    await ctx.db.delete(membership._id);

    // Update member count
    const group = await ctx.db.get(args.groupId);
    if (group) {
      await ctx.db.patch(args.groupId, {
        memberCount: Math.max(0, group.memberCount - 1),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get all groups (public or user's groups)
export const getGroups = query({
  args: {
    category: v.optional(
      v.union(v.literal("location"), v.literal("interest"), v.literal("goal"), v.literal("general"))
    ),
    locationId: v.optional(v.id("organizations")),
    interest: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkId = identity?.subject;

    let groups = await ctx.db.query("groups").collect();

    // Filter by category
    if (args.category) {
      groups = groups.filter((g) => g.category === args.category);
    }

    // Filter by location
    if (args.locationId) {
      groups = groups.filter((g) => g.locationId === args.locationId);
    }

    // Filter by interest
    if (args.interest) {
      groups = groups.filter((g) => g.interest === args.interest);
    }

    // If not authenticated, only show public groups
    if (!clerkId) {
      groups = groups.filter((g) => g.isPublic);
    }

    // Sort by member count and date
    groups.sort((a, b) => {
      if (b.memberCount !== a.memberCount) {
        return b.memberCount - a.memberCount;
      }
      return b.createdAt - a.createdAt;
    });

    // Limit results
    const limit = args.limit || 50;
    groups = groups.slice(0, limit);

    // Enrich with creator info and membership status
    const enrichedGroups = await Promise.all(
      groups.map(async (group) => {
        const creator = await ctx.db.get(group.creatorId);
        let isMember = false;
        let userRole: "admin" | "moderator" | "member" | null = null;

        if (clerkId) {
          const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();

          if (user) {
            const membership = await ctx.db
              .query("groupMembers")
              .withIndex("by_group_user", (q) =>
                q.eq("groupId", group._id).eq("userId", user._id)
              )
              .first();

            if (membership) {
              isMember = true;
              userRole = membership.role;
            }
          }
        }

        return {
          ...group,
          creatorName: creator?.name || "Unknown",
          creatorImage: creator?.image,
          isMember,
          userRole,
        };
      })
    );

    return enrichedGroups;
  },
});

// Get user's groups
export const getUserGroups = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        if (!group) return null;

        const creator = await ctx.db.get(group.creatorId);
        return {
          ...group,
          membershipRole: membership.role,
          joinedAt: membership.joinedAt,
          creatorName: creator?.name || "Unknown",
        };
      })
    );

    return groups.filter(Boolean);
  },
});

// Get group details
export const getGroupById = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkId = identity?.subject;

    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Check if user can view (public or member)
    if (!group.isPublic && clerkId) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (user) {
        const membership = await ctx.db
          .query("groupMembers")
          .withIndex("by_group_user", (q) =>
            q.eq("groupId", args.groupId).eq("userId", user._id)
          )
          .first();

        if (!membership) {
          throw new Error("Group is private");
        }
      } else {
        throw new Error("Group is private");
      }
    }

    const creator = await ctx.db.get(group.creatorId);
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          userName: user?.name || "Unknown",
          userImage: user?.image,
          userEmail: user?.email,
        };
      })
    );

    let isMember = false;
    let userRole: "admin" | "moderator" | "member" | null = null;

    if (clerkId) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (user) {
        const membership = await ctx.db
          .query("groupMembers")
          .withIndex("by_group_user", (q) =>
            q.eq("groupId", args.groupId).eq("userId", user._id)
          )
          .first();

        if (membership) {
          isMember = true;
          userRole = membership.role;
        }
      }
    }

    return {
      ...group,
      creatorName: creator?.name || "Unknown",
      creatorImage: creator?.image,
      members: enrichedMembers,
      isMember,
      userRole,
    };
  },
});

// Get group members
export const getGroupMembers = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          userName: user?.name || "Unknown",
          userImage: user?.image,
          userEmail: user?.email,
        };
      })
    );

    // Sort by role (admin, moderator, member) then by join date
    enrichedMembers.sort((a, b) => {
      const roleOrder = { admin: 0, moderator: 1, member: 2 };
      const roleDiff = roleOrder[a.role] - roleOrder[b.role];
      if (roleDiff !== 0) return roleDiff;
      return a.joinedAt - b.joinedAt;
    });

    return enrichedMembers;
  },
});

// Update group member role (admin only)
export const updateMemberRole = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("moderator"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is admin of the group
    const adminMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .first();

    if (!adminMembership || adminMembership.role !== "admin") {
      throw new Error("Only group admins can update member roles");
    }

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("Member not found");
    }

    await ctx.db.patch(membership._id, {
      role: args.role,
    });

    return { success: true };
  },
});

// Create group challenge
export const createGroupChallenge = mutation({
  args: {
    groupId: v.id("groups"),
    challengeId: v.id("challenges"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is member of the group
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("Must be a group member to create challenges");
    }

    await ctx.db.insert("groupChallenges", {
      groupId: args.groupId,
      challengeId: args.challengeId,
      createdBy: user._id,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Get group challenges
export const getGroupChallenges = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const groupChallenges = await ctx.db
      .query("groupChallenges")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const challenges = await Promise.all(
      groupChallenges.map(async (gc) => {
        const challenge = await ctx.db.get(gc.challengeId);
        return challenge ? { ...challenge, groupChallengeId: gc._id } : null;
      })
    );

    return challenges.filter(Boolean);
  },
});

// Get group leaderboard (based on challenges)
export const getGroupLeaderboard = query({
  args: {
    groupId: v.id("groups"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Get challenge participations for group members
    const leaderboard = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        if (!user) return null;

        // Get user's challenge participations
        const participations = await ctx.db
          .query("challengeParticipations")
          .withIndex("by_user", (q) => q.eq("userId", member.userId))
          .filter((q) => q.eq(q.field("completed"), true))
          .collect();

        // Get group challenges
        const groupChallenges = await ctx.db
          .query("groupChallenges")
          .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
          .collect();

        const groupChallengeIds = groupChallenges.map((gc) => gc.challengeId);
        const completedGroupChallenges = participations.filter((p) =>
          groupChallengeIds.includes(p.challengeId)
        ).length;

        return {
          userId: member.userId,
          clerkId: member.clerkId,
          userName: user.name,
          userImage: user.image,
          completedChallenges: completedGroupChallenges,
          totalChallenges: groupChallengeIds.length,
        };
      })
    );

    const validLeaderboard = leaderboard.filter(Boolean) as Array<{
      userId: Id<"users">;
      clerkId: string;
      userName: string;
      userImage?: string;
      completedChallenges: number;
      totalChallenges: number;
    }>;

    // Sort by completed challenges
    validLeaderboard.sort((a, b) => b.completedChallenges - a.completedChallenges);

    return validLeaderboard.slice(0, args.limit || 20);
  },
});

