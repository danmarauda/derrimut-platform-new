import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Member Communication Hub
 * In-app messaging system for member-to-member, member-to-trainer, member-to-admin
 */

// Send a message
export const sendMessage = mutation({
  args: {
    recipientClerkId: v.string(),
    message: v.string(),
    messageType: v.union(
      v.literal("direct"),
      v.literal("trainer"),
      v.literal("admin"),
      v.literal("group_announcement"),
      v.literal("broadcast")
    ),
    groupId: v.optional(v.id("groups")),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const sender = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!sender) {
      throw new Error("User not found");
    }

    // For broadcast messages, admin only
    if (args.messageType === "broadcast" && sender.role !== "admin" && sender.role !== "superadmin") {
      throw new Error("Unauthorized: Admin access required for broadcast messages");
    }

    // For group announcements, check if user is admin/moderator
    if (args.messageType === "group_announcement" && args.groupId) {
      const groupMember = await ctx.db
        .query("groupMembers")
        .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId!).eq("userId", sender._id))
        .first();

      if (!groupMember || (groupMember.role !== "admin" && groupMember.role !== "moderator")) {
        throw new Error("Unauthorized: Group admin/moderator access required");
      }
    }

    // Get recipient
    const recipient = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.recipientClerkId))
      .first();

    if (!recipient && args.messageType !== "broadcast") {
      throw new Error("Recipient not found");
    }

    // For broadcast, send to all users
    if (args.messageType === "broadcast") {
      const allUsers = await ctx.db.query("users").collect();
      const messageIds = [];

      for (const user of allUsers) {
        if (user.clerkId === identity.subject) continue; // Skip sender

        const messageId = await ctx.db.insert("memberMessages", {
          senderId: sender._id,
          senderClerkId: identity.subject,
          recipientId: user._id,
          recipientClerkId: user.clerkId,
          message: args.message,
          messageType: args.messageType,
          read: false,
          attachments: args.attachments,
          createdAt: Date.now(),
        });
        messageIds.push(messageId);

        // Send push notification
        await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
          userId: user._id,
          clerkId: user.clerkId,
          type: "system",
          title: "Broadcast Message",
          message: args.message,
          link: "/messages",
          sendPush: true,
        });
      }

      return messageIds;
    }

    // For group announcements, send to all group members
    if (args.messageType === "group_announcement" && args.groupId) {
      const groupMembers = await ctx.db
        .query("groupMembers")
        .withIndex("by_group", (q) => q.eq("groupId", args.groupId!))
        .collect();

      const messageIds = [];

      for (const member of groupMembers) {
        if (member.userId === sender._id) continue; // Skip sender

        const memberUser = await ctx.db.get(member.userId);
        if (!memberUser) continue;

        const messageId = await ctx.db.insert("memberMessages", {
          senderId: sender._id,
          senderClerkId: identity.subject,
          recipientId: member.userId,
          recipientClerkId: memberUser.clerkId,
          message: args.message,
          messageType: args.messageType,
          groupId: args.groupId,
          read: false,
          attachments: args.attachments,
          createdAt: Date.now(),
        });
        messageIds.push(messageId);

        // Send push notification
        await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
          userId: member.userId,
          clerkId: memberUser.clerkId,
          type: "social",
          title: "Group Announcement",
          message: args.message,
          link: `/groups/${args.groupId}`,
          sendPush: true,
        });
      }

      return messageIds;
    }

    // Regular direct message
    const messageId = await ctx.db.insert("memberMessages", {
      senderId: sender._id,
      senderClerkId: identity.subject,
      recipientId: recipient!._id,
      recipientClerkId: args.recipientClerkId,
      message: args.message,
      messageType: args.messageType,
      groupId: args.groupId,
      read: false,
      attachments: args.attachments,
      createdAt: Date.now(),
    });

    // Send push notification
    await ctx.scheduler.runAfter(0, api.notifications.createNotificationWithPush, {
      userId: recipient!._id,
      clerkId: args.recipientClerkId,
      type: args.messageType === "trainer" ? "booking" : "social",
      title: `Message from ${sender.name}`,
      message: args.message,
      link: "/messages",
      sendPush: true,
    });

    return messageId;
  },
});

// Get messages (conversation)
export const getMessages = query({
  args: {
    otherClerkId: v.optional(v.string()),
    messageType: v.optional(v.union(
      v.literal("direct"),
      v.literal("trainer"),
      v.literal("admin"),
      v.literal("group_announcement"),
      v.literal("broadcast")
    )),
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

    let messages = await ctx.db
      .query("memberMessages")
      .withIndex("by_recipient_clerk", (q) => q.eq("recipientClerkId", identity.subject))
      .order("desc")
      .collect();

    // Also get sent messages
    const sentMessages = await ctx.db
      .query("memberMessages")
      .withIndex("by_sender_clerk", (q) => q.eq("senderClerkId", identity.subject))
      .order("desc")
      .collect();

    // Combine and filter
    const allMessages = [...messages, ...sentMessages];

    // Filter by other user if provided
    if (args.otherClerkId) {
      messages = allMessages.filter(
        (m) =>
          (m.senderClerkId === identity.subject && m.recipientClerkId === args.otherClerkId) ||
          (m.recipientClerkId === identity.subject && m.senderClerkId === args.otherClerkId)
      );
    } else {
      messages = allMessages;
    }

    // Filter by message type
    if (args.messageType) {
      messages = messages.filter((m) => m.messageType === args.messageType);
    }

    // Sort by created date
    messages.sort((a, b) => a.createdAt - b.createdAt);

    // Enrich with sender/recipient info
    const enrichedMessages = await Promise.all(
      messages.slice(0, args.limit || 50).map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        const recipient = await ctx.db.get(msg.recipientId);
        return {
          ...msg,
          senderName: sender?.name,
          senderImage: sender?.image,
          recipientName: recipient?.name,
          recipientImage: recipient?.image,
        };
      })
    );

    return enrichedMessages;
  },
});

// Mark message as read
export const markMessageAsRead = mutation({
  args: {
    messageId: v.id("memberMessages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message || message.recipientClerkId !== identity.subject) {
      throw new Error("Message not found");
    }

    await ctx.db.patch(args.messageId, {
      read: true,
      readAt: Date.now(),
    });

    return { success: true };
  },
});

// Get unread message count
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const unreadMessages = await ctx.db
      .query("memberMessages")
      .withIndex("by_recipient_clerk", (q) => q.eq("recipientClerkId", identity.subject))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    return unreadMessages.length;
  },
});

// Get conversations list
export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    // Get all messages involving this user
    const receivedMessages = await ctx.db
      .query("memberMessages")
      .withIndex("by_recipient_clerk", (q) => q.eq("recipientClerkId", identity.subject))
      .collect();

    const sentMessages = await ctx.db
      .query("memberMessages")
      .withIndex("by_sender_clerk", (q) => q.eq("senderClerkId", identity.subject))
      .collect();

    // Group by other user
    const conversations: Record<string, any> = {};

    [...receivedMessages, ...sentMessages].forEach((msg) => {
      const otherClerkId =
        msg.senderClerkId === identity.subject ? msg.recipientClerkId : msg.senderClerkId;

      if (!conversations[otherClerkId]) {
        conversations[otherClerkId] = {
          otherClerkId,
          lastMessage: msg,
          unreadCount: 0,
        };
      }

      if (msg.createdAt > conversations[otherClerkId].lastMessage.createdAt) {
        conversations[otherClerkId].lastMessage = msg;
      }

      if (!msg.read && msg.recipientClerkId === identity.subject) {
        conversations[otherClerkId].unreadCount++;
      }
    });

    // Enrich with user info
    const enrichedConversations = await Promise.all(
      Object.values(conversations).map(async (conv) => {
        const otherUser = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", conv.otherClerkId))
          .first();

        return {
          ...conv,
          otherUserName: otherUser?.name,
          otherUserImage: otherUser?.image,
        };
      })
    );

    // Sort by last message time
    enrichedConversations.sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);

    return enrichedConversations;
  },
});

// Delete message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("memberMessages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only sender can delete
    if (message.senderClerkId !== identity.subject) {
      throw new Error("Unauthorized: Only sender can delete message");
    }

    await ctx.db.delete(args.messageId);
    return { success: true };
  },
});

