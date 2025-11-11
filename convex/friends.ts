import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Friends System
 * Social graph and friend connections
 */

// Send friend request
export const sendFriendRequest = mutation({
  args: {
    friendClerkId: v.string(),
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

    const friend = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.friendClerkId))
      .first();

    if (!friend) {
      throw new Error("Friend not found");
    }

    // Prevent self-friending
    if (user._id === friend._id) {
      throw new Error("Cannot send friend request to yourself");
    }

    // Check if friendship already exists
    const existingFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", identity.subject))
      .filter((q) => q.eq(q.field("friendClerkId"), args.friendClerkId))
      .first();

    if (existingFriendship) {
      if (existingFriendship.status === "accepted") {
        throw new Error("Already friends");
      }
      if (existingFriendship.status === "pending") {
        throw new Error("Friend request already sent");
      }
      if (existingFriendship.status === "blocked") {
        throw new Error("Cannot send request to blocked user");
      }
    }

    // Check reverse friendship (if they already sent a request)
    const reverseFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", args.friendClerkId))
      .filter((q) => q.eq(q.field("friendClerkId"), identity.subject))
      .first();

    if (reverseFriendship && reverseFriendship.status === "pending") {
      // Accept the existing request instead
      await ctx.db.patch(reverseFriendship._id, {
        status: "accepted",
        updatedAt: Date.now(),
      });

      // Create reverse friendship record
      await ctx.db.insert("friendships", {
        userId: user._id,
        friendId: friend._id,
        userClerkId: identity.subject,
        friendClerkId: args.friendClerkId,
        status: "accepted",
        requestedBy: friend._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Send notification
      await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
        userId: friend._id,
        clerkId: args.friendClerkId,
        type: "social",
        title: "Friend Request Accepted",
        message: `${user.name} accepted your friend request!`,
        link: `/profile/friends`,
        sendPush: true,
      });

      return { success: true, action: "accepted" };
    }

    // Create new friend request
    const friendshipId = await ctx.db.insert("friendships", {
      userId: user._id,
      friendId: friend._id,
      userClerkId: identity.subject,
      friendClerkId: args.friendClerkId,
      status: "pending",
      requestedBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Send notification to friend
    await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
      userId: friend._id,
      clerkId: args.friendClerkId,
      type: "social",
      title: "New Friend Request",
      message: `${user.name} sent you a friend request`,
      link: `/profile/friends`,
      sendPush: true,
    });

    return { success: true, friendshipId };
  },
});

// Accept friend request
export const acceptFriendRequest = mutation({
  args: {
    friendshipId: v.id("friendships"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) {
      throw new Error("Friendship not found");
    }

    // Only the friend (recipient) can accept
    if (friendship.friendClerkId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    if (friendship.status !== "pending") {
      throw new Error("Friend request already processed");
    }

    // Update friendship to accepted
    await ctx.db.patch(args.friendshipId, {
      status: "accepted",
      updatedAt: Date.now(),
    });

    // Create reverse friendship record
    await ctx.db.insert("friendships", {
      userId: friendship.friendId,
      friendId: friendship.userId,
      userClerkId: friendship.friendClerkId,
      friendClerkId: friendship.userClerkId,
      status: "accepted",
      requestedBy: friendship.requestedBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Send notification to requester
    const requester = await ctx.db.get(friendship.userId);
    if (requester) {
      await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
        userId: friendship.userId,
        clerkId: friendship.userClerkId,
        type: "social",
        title: "Friend Request Accepted",
        message: `${requester.name} accepted your friend request!`,
        link: `/profile/friends`,
        sendPush: true,
      });
    }

    return { success: true };
  },
});

// Decline friend request
export const declineFriendRequest = mutation({
  args: {
    friendshipId: v.id("friendships"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) {
      throw new Error("Friendship not found");
    }

    // Only the friend (recipient) can decline
    if (friendship.friendClerkId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Delete the friendship request
    await ctx.db.delete(args.friendshipId);

    return { success: true };
  },
});

// Remove friend
export const removeFriend = mutation({
  args: {
    friendClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Delete both friendship records
    const friendships = await ctx.db
      .query("friendships")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", identity.subject))
      .filter((q) => q.eq(q.field("friendClerkId"), args.friendClerkId))
      .collect();

    await Promise.all(friendships.map((f) => ctx.db.delete(f._id)));

    // Delete reverse friendships
    const reverseFriendships = await ctx.db
      .query("friendships")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", args.friendClerkId))
      .filter((q) => q.eq(q.field("friendClerkId"), identity.subject))
      .collect();

    await Promise.all(reverseFriendships.map((f) => ctx.db.delete(f._id)));

    return { success: true };
  },
});

// Block user
export const blockUser = mutation({
  args: {
    friendClerkId: v.string(),
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

    const friend = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.friendClerkId))
      .first();

    if (!friend) {
      throw new Error("User not found");
    }

    // Delete existing friendships
    await ctx.runMutation(api.friends.removeFriend, { friendClerkId: args.friendClerkId });

    // Create blocked friendship
    await ctx.db.insert("friendships", {
      userId: user._id,
      friendId: friend._id,
      userClerkId: identity.subject,
      friendClerkId: args.friendClerkId,
      status: "blocked",
      requestedBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get user's friends
export const getUserFriends = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = args.clerkId || identity.subject;

    const friendships = await ctx.db
      .query("friendships")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", clerkId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    // Enrich with friend information
    const friends = await Promise.all(
      friendships.map(async (friendship) => {
        const friend = await ctx.db.get(friendship.friendId);
        return {
          ...friendship,
          friendName: friend?.name || "Unknown",
          friendEmail: friend?.email || "Unknown",
          friendImage: friend?.image,
        };
      })
    );

    return friends;
  },
});

// Get pending friend requests (received)
export const getPendingFriendRequests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const requests = await ctx.db
      .query("friendships")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", identity.subject))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Enrich with requester information
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.userId);
        return {
          ...request,
          requesterName: requester?.name || "Unknown",
          requesterEmail: requester?.email || "Unknown",
          requesterImage: requester?.image,
        };
      })
    );

    return enrichedRequests;
  },
});

// Get sent friend requests (pending)
export const getSentFriendRequests = query({
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

    const requests = await ctx.db
      .query("friendships")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", identity.subject))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .filter((q) => q.eq(q.field("requestedBy"), user._id))
      .collect();

    // Enrich with friend information
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const friend = await ctx.db.get(request.friendId);
        return {
          ...request,
          friendName: friend?.name || "Unknown",
          friendEmail: friend?.email || "Unknown",
          friendImage: friend?.image,
        };
      })
    );

    return enrichedRequests;
  },
});

// Search users (for finding friends)
export const searchUsers = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const searchTerm = args.query.toLowerCase();
    const limit = args.limit || 20;

    // Get all users and filter (in production, use a proper search index)
    const allUsers = await ctx.db.query("users").collect();

    const matchingUsers = allUsers
      .filter(
        (user) =>
          user.clerkId !== identity.subject &&
          (user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm))
      )
      .slice(0, limit);

    // Check friendship status for each user
    const enrichedUsers = await Promise.all(
      matchingUsers.map(async (user) => {
        const friendship = await ctx.db
          .query("friendships")
          .withIndex("by_user_clerk", (q) => q.eq("userClerkId", identity.subject))
          .filter((q) => q.eq(q.field("friendClerkId"), user.clerkId))
          .first();

        return {
          _id: user._id,
          clerkId: user.clerkId,
          name: user.name,
          email: user.email,
          image: user.image,
          friendshipStatus: friendship?.status || null,
        };
      })
    );

    return enrichedUsers;
  },
});

// Get friend activity feed
export const getFriendActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user's friends
    const friends = await ctx.runQuery(api.friends.getUserFriends, { clerkId: identity.subject });
    const friendClerkIds = friends.map((f: any) => f.friendClerkId);

    if (friendClerkIds.length === 0) {
      return [];
    }

    // Get recent check-ins from friends
    const allCheckIns = await ctx.db.query("memberCheckIns").collect();
    const friendCheckIns = allCheckIns
      .filter((ci) => friendClerkIds.includes(ci.clerkId))
      .sort((a, b) => b.checkInTime - a.checkInTime)
      .slice(0, args.limit || 20);

    // Get recent achievements from friends
    const allAchievements = await ctx.db.query("achievements").collect();
    const friendAchievements = allAchievements
      .filter((a) => friendClerkIds.includes(a.clerkId))
      .sort((a, b) => b.unlockedAt - a.unlockedAt)
      .slice(0, args.limit || 20);

    // Get recent challenge completions from friends
    const allChallenges = await ctx.db.query("challengeParticipations").collect();
    const friendUserIds = new Set(
      (await Promise.all(
        friendClerkIds.map(async (clerkId: string) => {
          const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();
          return user?._id;
        })
      )).filter((id: any) => id !== undefined)
    );
    
    const friendChallenges = allChallenges
      .filter((c) => friendUserIds.has(c.userId) && c.completed)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
      .slice(0, args.limit || 20);

    // Combine and sort by date
    const checkInActivities = friendCheckIns.map((ci) => ({
      type: "check_in" as const,
      data: ci,
      createdAt: ci.checkInTime,
      clerkId: ci.clerkId,
    }));

    const achievementActivities = friendAchievements.map((a) => ({
      type: "achievement" as const,
      data: a,
      createdAt: a.unlockedAt,
      clerkId: a.clerkId,
    }));

    // Map challenge completions to activities
    const challengeActivities = await Promise.all(
      friendChallenges.map(async (c) => {
        const challengeUser = await ctx.db.get(c.userId);
        if (!challengeUser) return null;
        const userWithClerk = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), c.userId))
          .first();
        return userWithClerk ? {
          type: "challenge" as const,
          data: c,
          createdAt: c.completedAt || 0,
          clerkId: userWithClerk.clerkId,
        } : null;
      })
    );

    const activities: any[] = [
      ...checkInActivities,
      ...achievementActivities,
      ...challengeActivities.filter((a) => a !== null),
    ];

    activities.sort((a, b) => b.createdAt - a.createdAt);

    // Enrich with user information
    const enrichedActivities = await Promise.all(
      activities.slice(0, args.limit || 20).map(async (activity) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", activity.clerkId))
          .first();

        return {
          ...activity,
          userName: user?.name || "Unknown",
          userImage: user?.image,
        };
      })
    );

    return enrichedActivities;
  },
});

// Get friend leaderboard
export const getFriendLeaderboard = query({
  args: {
    metric: v.optional(v.union(
      v.literal("check_ins"),
      v.literal("streak"),
      v.literal("challenges"),
      v.literal("achievements")
    )),
    period: v.optional(v.union(
      v.literal("week"),
      v.literal("month"),
      v.literal("all_time")
    )),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const metric = args.metric || "check_ins";
    const period = args.period || "all_time";

    // Get user's friends
    const friends = await ctx.runQuery(api.friends.getUserFriends, { clerkId: identity.subject });
    const friendClerkIds = friends.map((f: any) => f.friendClerkId);

    // Include current user in leaderboard
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    const allClerkIds = [identity.subject, ...friendClerkIds];
    const leaderboard: any[] = [];

    // Calculate time range
    let timeStart = 0;
    if (period === "week") {
      timeStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
    } else if (period === "month") {
      timeStart = Date.now() - 30 * 24 * 60 * 60 * 1000;
    }

    for (const clerkId of allClerkIds) {
      const friendUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (!friendUser) continue;

      let score = 0;

      if (metric === "check_ins") {
        const checkIns = await ctx.db
          .query("memberCheckIns")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
          .filter((q) => q.gte(q.field("checkInTime"), timeStart))
          .collect();
        score = checkIns.length;
      } else if (metric === "streak") {
        const checkIns = await ctx.db
          .query("memberCheckIns")
          .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
          .order("desc")
          .collect();
        const recentCheckIns = checkIns.slice(0, 100);

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < recentCheckIns.length; i++) {
          const checkInDate = new Date(recentCheckIns[i].checkInTime);
          checkInDate.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff === i) {
            streak++;
          } else {
            break;
          }
        }
        score = streak;
      } else if (metric === "challenges") {
        const challenges = await ctx.db
          .query("challengeParticipations")
          .withIndex("by_user", (q) => q.eq("userId", friendUser._id))
          .filter((q) => q.eq(q.field("completed"), true))
          .collect();
        score = challenges.length;
      } else if (metric === "achievements") {
        const achievements = await ctx.db
          .query("achievements")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
          .collect();
        score = achievements.length;
      }

      leaderboard.push({
        clerkId,
        userId: friendUser._id,
        name: friendUser.name,
        image: friendUser.image,
        score,
        isCurrentUser: clerkId === identity.subject,
      });
    }

    // Sort by score descending
    leaderboard.sort((a, b) => b.score - a.score);

    return leaderboard;
  },
});

// Find workout buddies (users with similar workout patterns)
export const findWorkoutBuddies = query({
  args: {
    limit: v.optional(v.number()),
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
      return [];
    }

    // Get user's check-in pattern (typical workout times)
    const userCheckIns = await ctx.db
      .query("memberCheckIns")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .order("desc")
      .collect();
    const recentUserCheckIns = userCheckIns.slice(0, 30);

    if (recentUserCheckIns.length < 5) {
      return []; // Not enough data
    }

    // Calculate user's typical workout hours
    const userHours: number[] = [];
    for (const checkIn of recentUserCheckIns) {
      const date = new Date(checkIn.checkInTime);
      userHours.push(date.getHours());
    }

    const userModeHour = userHours.reduce((a, b, _, arr) =>
      arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b
    );

    // Get user's typical workout days
    const userDays: number[] = [];
    for (const checkIn of recentUserCheckIns) {
      const date = new Date(checkIn.checkInTime);
      userDays.push(date.getDay());
    }

    // Find users with similar patterns (not already friends)
    const friends = await ctx.runQuery(api.friends.getUserFriends, { clerkId: identity.subject });
    const friendClerkIds = new Set(friends.map((f: any) => f.friendClerkId));

    const allUsers = await ctx.db.query("users").collect();
    const potentialBuddies: any[] = [];

    for (const potentialBuddy of allUsers) {
      if (
        potentialBuddy.clerkId === identity.subject ||
        friendClerkIds.has(potentialBuddy.clerkId)
      ) {
        continue;
      }

      const buddyCheckIns = await ctx.db
        .query("memberCheckIns")
        .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", potentialBuddy.clerkId))
        .order("desc")
        .collect();
      const recentBuddyCheckIns = buddyCheckIns.slice(0, 30);

      if (recentBuddyCheckIns.length < 5) continue;

      // Calculate buddy's typical workout hour
      const buddyHours: number[] = [];
      for (const checkIn of recentBuddyCheckIns) {
        const date = new Date(checkIn.checkInTime);
        buddyHours.push(date.getHours());
      }

      const buddyModeHour = buddyHours.reduce((a, b, _, arr) =>
        arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b
      );

      // Calculate similarity score (same hour = higher score)
      const hourDiff = Math.abs(userModeHour - buddyModeHour);
      const similarityScore = hourDiff <= 2 ? 100 - hourDiff * 10 : 0;

      if (similarityScore > 0) {
        potentialBuddies.push({
          clerkId: potentialBuddy.clerkId,
          userId: potentialBuddy._id,
          name: potentialBuddy.name,
          image: potentialBuddy.image,
          similarityScore,
          typicalHour: buddyModeHour,
        });
      }
    }

    // Sort by similarity score
    potentialBuddies.sort((a, b) => b.similarityScore - a.similarityScore);

    return potentialBuddies.slice(0, args.limit || 10);
  },
});

// Notify friends when user unlocks an achievement
export const notifyFriendsOfAchievement = mutation({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
    achievementTitle: v.string(),
    achievementDescription: v.string(),
    achievementIcon: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    // Get user's friends
    const friends: any[] = await ctx.runQuery(api.friends.getUserFriends, { clerkId: args.clerkId });

    const user = await ctx.db.get(args.userId);
    if (!user) return;

    // Notify each friend
    for (const friend of friends) {
      await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
        userId: friend.userId,
        clerkId: friend.friendClerkId,
        type: "social",
        title: `${user.name} unlocked an achievement! 🎉`,
        message: `${args.achievementIcon} ${args.achievementTitle}: ${args.achievementDescription}`,
        link: `/profile/friends`,
        sendPush: true,
        skipAuthCheck: true,
      });
    }

    return; // Return void instead of object
  },
});

// Group Workouts with Friends

// Create a group workout
export const createGroupWorkout = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    locationId: v.id("organizations"),
    scheduledTime: v.number(),
    maxParticipants: v.optional(v.number()),
    friendClerkIds: v.array(v.string()), // Friends to invite
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

    // Verify friends exist and are actually friends
    const friends = await ctx.runQuery(api.friends.getUserFriends, { clerkId: identity.subject });
    const friendClerkIdSet = new Set(friends.map((f: any) => f.friendClerkId));

    const validFriendIds: any[] = [];
    for (const friendClerkId of args.friendClerkIds) {
      if (friendClerkIdSet.has(friendClerkId)) {
        const friendUser = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", friendClerkId))
          .first();
        if (friendUser) {
          validFriendIds.push(friendUser._id);
        }
      }
    }

    // Create group workout
    const workoutId = await ctx.db.insert("groupWorkouts", {
      organizerId: user._id,
      organizerClerkId: identity.subject,
      title: args.title,
      description: args.description,
      locationId: args.locationId,
      scheduledTime: args.scheduledTime,
      maxParticipants: args.maxParticipants,
      participants: [user._id, ...validFriendIds],
      status: "scheduled",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Notify invited friends
    for (const friendClerkId of args.friendClerkIds) {
      if (friendClerkIdSet.has(friendClerkId)) {
        const friendUser = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", friendClerkId))
          .first();
        if (friendUser) {
          await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
            userId: friendUser._id,
            clerkId: friendClerkId,
            type: "social",
            title: `${user.name} invited you to a group workout!`,
            message: args.title,
            link: `/workouts/${workoutId}`,
            sendPush: true,
            skipAuthCheck: true,
          });
        }
      }
    }

    return workoutId;
  },
});

// Get user's group workouts
export const getUserGroupWorkouts = query({
  args: {
    status: v.optional(v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled"))),
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
      return [];
    }

    const allWorkouts = await ctx.db.query("groupWorkouts").collect();
    const userWorkouts = allWorkouts.filter(
      (w) => w.participants.includes(user._id) && (!args.status || w.status === args.status)
    );

    // Enrich with location and organizer info
    const enrichedWorkouts = await Promise.all(
      userWorkouts.map(async (workout) => {
        const organizer = await ctx.db.get(workout.organizerId);
        const location = await ctx.db.get(workout.locationId);
        const participants = await Promise.all(
          workout.participants.map(async (pId) => {
            const p = await ctx.db.get(pId);
            return p ? { id: p._id, name: p.name, image: p.image } : null;
          })
        );

        return {
          ...workout,
          organizerName: organizer?.name || "Unknown",
          organizerImage: organizer?.image,
          locationName: location?.name || "Unknown",
          participants: participants.filter((p) => p !== null),
        };
      })
    );

    return enrichedWorkouts.sort((a, b) => a.scheduledTime - b.scheduledTime);
  },
});

