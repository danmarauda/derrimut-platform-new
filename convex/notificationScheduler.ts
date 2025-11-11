import { internalMutation, internalQuery, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
// Note: convex/cron may not be available in all Convex versions
// import { cronJobs } from "convex/cron";

/**
 * Smart Notification Scheduler
 * Automated notifications for classes, streaks, and other events
 * 
 * Note: cronJobs from convex/cron is not available in this version.
 * These functions can be called manually or scheduled via external cron services.
 */

// Check and send class reminders (1 hour before class)
export const checkClassReminders = internalAction({
  args: {},
  handler: async (ctx): Promise<{ remindersSent: number; classesChecked: number }> => {
    const now = Date.now();
    const oneHourFromNow = now + 60 * 60 * 1000; // 1 hour in milliseconds
    const fifteenMinutesAgo = now - 15 * 60 * 1000; // 15 minutes ago

    // Get all upcoming classes starting within the next hour
    const upcomingClasses: any[] = await ctx.runQuery(internal.notificationScheduler.getUpcomingClasses, {
      startTimeMin: now,
      startTimeMax: oneHourFromNow,
    });

    let remindersSent = 0;

    for (const classItem of upcomingClasses) {
      // Get all bookings for this class
      const bookings = await ctx.runQuery(internal.notificationScheduler.getClassBookings, {
        classId: classItem._id,
      });

      for (const booking of bookings) {
        // Check if reminder already sent (within last 15 minutes)
        const existingReminder = await ctx.runQuery(
          internal.notificationScheduler.getExistingReminder,
          {
            userId: booking.userId,
            classId: classItem._id,
            reminderType: "class_reminder",
            minTime: fifteenMinutesAgo,
          }
        );

        if (!existingReminder) {
          // Get user details
          const user = await ctx.runQuery(internal.notificationScheduler.getUserById, {
            userId: booking.userId,
          });

          if (!user) continue;

          // Get location details
          const location = await ctx.runQuery(internal.notificationScheduler.getLocationById, {
            locationId: classItem.locationId,
          });

          // Format class time
          const classStart = new Date(classItem.startTime);
          const timeString = classStart.toLocaleTimeString("en-AU", {
            hour: "2-digit",
            minute: "2-digit",
          });

          // Send push notification
          await ctx.runAction(api.pushNotifications.sendPushNotification, {
            clerkId: user.clerkId,
            title: "Class Reminder",
            message: `${classItem.name} starts in 1 hour at ${timeString}${location ? ` - ${location.name}` : ""}`,
            link: `/classes`,
            type: "class_reminder",
          });

          // Send SMS if user has SMS enabled
          const smsSubscriptions = await ctx.runQuery(
            internal.notificationScheduler.getUserSMSSubscriptions,
            {
              clerkId: user.clerkId,
            }
          );

          const hasSMSEnabled = smsSubscriptions.some(
            (sub: any) => sub.isActive && sub.preferences.classReminders && sub.verified
          );

          if (hasSMSEnabled && user.phoneNumber) {
            await ctx.runAction(api.smsNotifications.sendSMS, {
              clerkId: user.clerkId,
              phoneNumber: user.phoneNumber,
              message: `Derrimut 24:7: ${classItem.name} starts in 1 hour at ${timeString}${location ? ` - ${location.name}` : ""}`,
              type: "class_reminder",
            });
          }

          // Create in-app notification
          await ctx.runMutation(api.notifications.createNotificationWithPush, {
            userId: user._id,
            clerkId: user.clerkId,
            type: "class_reminder",
            title: "Class Reminder",
            message: `${classItem.name} starts in 1 hour at ${timeString}`,
            link: `/classes`,
            sendPush: false, // Already sent above
            skipAuthCheck: true,
          });

          // Record reminder sent
          await ctx.runMutation(internal.notificationScheduler.recordReminderSent, {
            userId: user._id,
            clerkId: user.clerkId,
            classId: classItem._id,
            reminderType: "class_reminder",
            sentAt: now,
          });

          remindersSent++;
        }
      }
    }

    return { remindersSent, classesChecked: upcomingClasses.length };
  },
});

// Check and send streak reminders
export const checkStreakReminders = internalAction({
  args: {},
  handler: async (ctx): Promise<{ remindersSent: number }> => {
    // Get users with active streaks who haven't checked in today
    const usersWithStreaks: any[] = await ctx.runQuery(
      internal.notificationScheduler.getUsersWithActiveStreaks
    );

    const now = Date.now();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayStartTime = todayStart.getTime();

    let remindersSent = 0;

    for (const user of usersWithStreaks) {
      // Check if user checked in today
      const todayCheckIn = await ctx.runQuery(internal.notificationScheduler.getTodayCheckIn, {
        clerkId: user.clerkId,
        minTime: todayStartTime,
      });

      if (!todayCheckIn) {
        // User hasn't checked in today - send streak reminder
        const streakDays = user.checkInStreak || 0;

        // Only remind if streak is 3+ days (to avoid spam)
        if (streakDays >= 3) {
          // Check if reminder already sent today
          const existingReminder = await ctx.runQuery(
            internal.notificationScheduler.getExistingReminder,
            {
              userId: user._id,
              reminderType: "streak_reminder",
              minTime: todayStartTime,
            }
          );

          if (!existingReminder) {
            // Send push notification
            await ctx.runAction(api.pushNotifications.sendPushNotification, {
              clerkId: user.clerkId,
              title: "Keep Your Streak Going! 🔥",
              message: `You're on a ${streakDays}-day streak! Check in today to keep it going.`,
              link: `/check-in`,
              type: "system",
            });

            // Create in-app notification
            await ctx.runMutation(api.notifications.createNotificationWithPush, {
              userId: user._id,
              clerkId: user.clerkId,
              type: "system",
              title: "Streak Reminder",
              message: `You're on a ${streakDays}-day streak! Check in today to keep it going.`,
              link: `/check-in`,
              sendPush: false,
              skipAuthCheck: true,
            });

            // Record reminder sent
            await ctx.runMutation(internal.notificationScheduler.recordReminderSent, {
              userId: user._id,
              clerkId: user.clerkId,
              reminderType: "streak_reminder",
              sentAt: now,
            });

            remindersSent++;
          }
        }
      }
    }

    return { remindersSent };
  },
});

// Helper queries and mutations

export const getUpcomingClasses = internalQuery({
  args: {
    startTimeMin: v.number(),
    startTimeMax: v.number(),
  },
  handler: async (ctx, args) => {
    const classes = await ctx.db
      .query("groupClasses")
      .withIndex("by_time", (q) => q.gte("startTime", args.startTimeMin))
      .filter((q) =>
        q.and(
          q.lte(q.field("startTime"), args.startTimeMax),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    return classes;
  },
});

export const getClassBookings = internalQuery({
  args: {
    classId: v.id("groupClasses"),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("classBookings")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .filter((q) => q.eq(q.field("status"), "booked"))
      .collect();

    return bookings;
  },
});

export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getLocationById = internalQuery({
  args: { locationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.locationId);
  },
});

export const getUserSMSSubscriptions = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("smsSubscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return subscriptions;
  },
});

export const getUsersWithActiveStreaks = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Get all users and filter by streak manually since checkInStreak may not be indexed
    const users = await ctx.db.query("users").collect();
    return users.filter((u: any) => (u.checkInStreak || 0) >= 3);
  },
});

export const getTodayCheckIn = internalQuery({
  args: {
    clerkId: v.string(),
    minTime: v.number(),
  },
  handler: async (ctx, args) => {
    const checkIns = await ctx.db
      .query("memberCheckIns")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .filter((q) => q.gte(q.field("checkInTime"), args.minTime))
      .take(1);

    return checkIns.length > 0 ? checkIns[0] : null;
  },
});

export const getExistingReminder = internalQuery({
  args: {
    userId: v.id("users"),
    reminderType: v.string(),
    minTime: v.number(),
    classId: v.optional(v.id("groupClasses")),
  },
  handler: async (ctx, args) => {
    // Check notifications table for existing reminder
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), args.reminderType as any),
          q.gte(q.field("createdAt"), args.minTime)
        )
      )
      .take(1);

    return notifications.length > 0 ? notifications[0] : null;
  },
});

export const recordReminderSent = internalMutation({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
    reminderType: v.string(),
    sentAt: v.number(),
    classId: v.optional(v.id("groupClasses")),
  },
  handler: async (ctx, args) => {
    // This is tracked via the notifications table, so we don't need a separate table
    // But we could add a reminderLogs table if needed for analytics
    return { success: true };
  },
});

// Check and send personalized workout reminders
export const checkWorkoutReminders = internalAction({
  args: {},
  handler: async (ctx): Promise<{ remindersSent: number; membersChecked: number }> => {
    const now = Date.now();
    const thirtyMinutesFromNow = now + 30 * 60 * 1000; // 30 minutes in milliseconds
    const oneHourAgo = now - 60 * 60 * 1000; // 1 hour ago

    // Get all active members with memberships
    const memberships: any[] = await ctx.runQuery(internal.notificationScheduler.getAllActiveMemberships);

    let remindersSent = 0;

    for (const membership of memberships) {
      const user = await ctx.runQuery(internal.notificationScheduler.getUserById, {
        userId: membership.userId,
      });

      if (!user) continue;

      // Calculate user's typical workout time from check-in history
      const typicalWorkoutTime = await ctx.runQuery(
        internal.notificationScheduler.getTypicalWorkoutTime,
        {
          clerkId: user.clerkId,
        }
      );

      if (!typicalWorkoutTime) continue; // Skip if no pattern detected

      // Check if it's time to send reminder (30 min before typical workout time)
      const currentHour = new Date(now).getHours();
      const reminderHour = typicalWorkoutTime.hour;
      const reminderMinute = typicalWorkoutTime.minute;

      // Calculate reminder time (30 minutes before workout)
      const reminderTime = reminderHour * 60 + reminderMinute - 30;
      const currentTime = currentHour * 60 + new Date(now).getMinutes();

      // Check if we're within the reminder window (current time matches reminder time ± 5 minutes)
      if (Math.abs(currentTime - reminderTime) <= 5) {
        // Check if reminder already sent today
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const existingReminder = await ctx.runQuery(
          internal.notificationScheduler.getExistingReminder,
          {
            userId: user._id,
            reminderType: "workout_reminder",
            minTime: todayStart.getTime(),
          }
        );

        if (!existingReminder) {
          // Check user preferences
          const pushSubscriptions = await ctx.runQuery(
            internal.notificationScheduler.getUserPushSubscriptions,
            {
              clerkId: user.clerkId,
            }
          );

          const hasWorkoutRemindersEnabled = pushSubscriptions.some(
            (sub: any) => sub.isActive && sub.preferences.workoutReminders
          );

          if (hasWorkoutRemindersEnabled) {
            // Send push notification
            await ctx.runAction(api.pushNotifications.sendPushNotification, {
              clerkId: user.clerkId,
              title: "Time for Your Workout! 💪",
              message: `Your typical workout time is coming up. Ready to crush your goals?`,
              link: `/check-in`,
              type: "system",
            });

            // Create in-app notification
            await ctx.runMutation(api.notifications.createNotificationWithPush, {
              userId: user._id,
              clerkId: user.clerkId,
              type: "system",
              title: "Workout Reminder",
              message: `Your typical workout time is coming up. Ready to crush your goals?`,
              link: `/check-in`,
              sendPush: false,
              skipAuthCheck: true,
            });

            remindersSent++;
          }
        }
      }
    }

    return { remindersSent, membersChecked: memberships.length };
  },
});

// Check and send event reminders
export const checkEventReminders = internalAction({
  args: {},
  handler: async (ctx): Promise<any> => {
    // sendEventReminders doesn't exist, return empty result for now
    // TODO: Implement event reminders functionality
    return { remindersSent: 0, eventsChecked: 0 };
  },
});

// Check and expire old loyalty points
export const checkPointsExpiration = internalAction({
  args: {},
  handler: async (ctx): Promise<any> => {
    const result: any = await ctx.runMutation(api.loyalty.expireOldPoints, {});
    return result;
  },
});

// Smart notification timing helper
export const isGoodTimeToNotify = (userTimezone?: string): boolean => {
  // Default to UTC if no timezone provided
  const tz = userTimezone || "UTC";
  const now = new Date();
  
  // Convert to user's timezone
  const userTime = new Date(now.toLocaleString("en-US", { timeZone: tz }));
  const hour = userTime.getHours();

  // Don't send notifications between 10 PM and 8 AM (user's local time)
  return hour >= 8 && hour < 22;
};

// Get user's timezone preference (could be stored in user profile)
export const getUserTimezone = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    // For now, return UTC. In the future, store timezone in user profile
    return user?.timezone || "UTC";
  },
});

export const getAllActiveMemberships = internalQuery({
  args: {},
  handler: async (ctx) => {
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    return memberships;
  },
});

export const getTypicalWorkoutTime = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Get last 30 check-ins to analyze pattern
    const checkIns = await ctx.db
      .query("memberCheckIns")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .take(30);

    if (checkIns.length < 5) {
      return null; // Not enough data
    }

    // Extract hours from check-ins
    const hours: number[] = [];
    const minutes: number[] = [];

    for (const checkIn of checkIns) {
      const date = new Date(checkIn.checkInTime);
      hours.push(date.getHours());
      minutes.push(date.getMinutes());
    }

    // Calculate mode (most common hour)
    const hourCounts: Record<number, number> = {};
    for (const hour of hours) {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }

    const mostCommonHour = Object.keys(hourCounts).reduce((a, b) =>
      hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b
    );

    // Calculate average minute for that hour
    const sameHourCheckIns = checkIns.filter(
      (ci) => new Date(ci.checkInTime).getHours() === parseInt(mostCommonHour)
    );
    const avgMinute = Math.round(
      sameHourCheckIns.reduce(
        (sum, ci) => sum + new Date(ci.checkInTime).getMinutes(),
        0
      ) / sameHourCheckIns.length
    );

    return {
      hour: parseInt(mostCommonHour),
      minute: avgMinute,
      confidence: hourCounts[parseInt(mostCommonHour)] / checkIns.length, // Percentage of check-ins at this time
    };
  },
});

export const getUserPushSubscriptions = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return subscriptions;
  },
});

