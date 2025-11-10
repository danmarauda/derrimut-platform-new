import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Group Fitness Classes System
 * Members can view and book group fitness classes
 */

// Get all active classes
export const getActiveClasses = query({
  args: {
    locationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let query = ctx.db
      .query("groupClasses")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => q.gte(q.field("endTime"), now));

    if (args.locationId) {
      query = query.filter((q) => q.eq(q.field("locationId"), args.locationId));
    }

    const classes = await query.collect();

    // Get booking counts
    const classesWithStats = await Promise.all(
      classes.map(async (classItem) => {
        const bookings = await ctx.db
          .query("classBookings")
          .withIndex("by_class", (q) => q.eq("classId", classItem._id))
          .collect();

        const bookedCount = bookings.filter(b => b.status === "booked").length;
        const availableSpots = classItem.capacity - bookedCount;

        // Get instructor details
        const instructor = await ctx.db.get(classItem.instructorId);
        const location = await ctx.db.get(classItem.locationId);

        return {
          ...classItem,
          bookedCount,
          availableSpots,
          instructor: instructor ? {
            name: instructor.name,
            image: instructor.image,
          } : null,
          location: location ? {
            name: location.name,
            address: location.address,
          } : null,
        };
      })
    );

    return classesWithStats.sort((a, b) => a.startTime - b.startTime);
  },
});

// Book a class
export const bookClass = mutation({
  args: {
    classId: v.id("groupClasses"),
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

    // Check if user has active membership
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership) {
      throw new Error("Active membership required to book classes");
    }

    const classItem = await ctx.db.get(args.classId);
    if (!classItem) {
      throw new Error("Class not found");
    }

    if (!classItem.isActive) {
      throw new Error("Class is not active");
    }

    // Check if class is full
    const bookings = await ctx.db
      .query("classBookings")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .filter((q) => q.eq(q.field("status"), "booked"))
      .collect();

    if (bookings.length >= classItem.capacity) {
      throw new Error("Class is full");
    }

    // Check if already booked
    const existing = await ctx.db
      .query("classBookings")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (existing && existing.status === "booked") {
      throw new Error("Already booked for this class");
    }

    // Create booking
    const bookingId = await ctx.db.insert("classBookings", {
      classId: args.classId,
      userId: user._id,
      clerkId: identity.subject,
      status: "booked",
      bookedAt: Date.now(),
    });

    return bookingId;
  },
});

// Cancel class booking
export const cancelClassBooking = mutation({
  args: {
    bookingId: v.id("classBookings"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.clerkId !== identity.subject) {
      throw new Error("Not authorized");
    }

    if (booking.status === "cancelled") {
      throw new Error("Booking already cancelled");
    }

    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
    });

    return { success: true };
  },
});

// Get user's class bookings
export const getUserClassBookings = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = args.clerkId || identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const bookings = await ctx.db
      .query("classBookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Get class details
    const bookingsWithClasses = await Promise.all(
      bookings.map(async (booking) => {
        const classItem = await ctx.db.get(booking.classId);
        if (!classItem) return null;

        const instructor = await ctx.db.get(classItem.instructorId);
        const location = await ctx.db.get(classItem.locationId);

        return {
          ...booking,
          class: {
            name: classItem.name,
            description: classItem.description,
            category: classItem.category,
            startTime: classItem.startTime,
            endTime: classItem.endTime,
            duration: classItem.duration,
            instructor: instructor ? {
              name: instructor.name,
              image: instructor.image,
            } : null,
            location: location ? {
              name: location.name,
              address: location.address,
            } : null,
          },
        };
      })
    );

    return bookingsWithClasses.filter(Boolean);
  },
});

// Create a class (instructor/admin only)
export const createClass = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    locationId: v.id("organizations"),
    category: v.union(
      v.literal("yoga"),
      v.literal("zumba"),
      v.literal("spin"),
      v.literal("hiit"),
      v.literal("pilates"),
      v.literal("strength"),
      v.literal("cardio"),
      v.literal("dance")
    ),
    capacity: v.number(),
    duration: v.number(),
    startTime: v.number(),
    endTime: v.number(),
    recurring: v.optional(v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("none")
    )),
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

    if (!user || (user.role !== "admin" && user.role !== "superadmin" && user.role !== "trainer")) {
      throw new Error("Unauthorized: Trainer/Admin access required");
    }

    const classId = await ctx.db.insert("groupClasses", {
      name: args.name,
      description: args.description,
      instructorId: user._id,
      instructorClerkId: identity.subject,
      locationId: args.locationId,
      category: args.category,
      capacity: args.capacity,
      duration: args.duration,
      startTime: args.startTime,
      endTime: args.endTime,
      recurring: args.recurring || "none",
      isActive: true,
      attendees: [],
      waitlist: [],
      createdAt: Date.now(),
    });

    return classId;
  },
});
