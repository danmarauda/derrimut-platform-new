import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Equipment Reservation System
 * Members can reserve gym equipment for specific time slots
 */

// Reserve equipment
export const reserveEquipment = mutation({
  args: {
    equipmentId: v.id("inventory"),
    locationId: v.id("organizations"),
    startTime: v.number(),
    endTime: v.number(),
    notes: v.optional(v.string()),
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
      throw new Error("Active membership required to reserve equipment");
    }

    const equipment = await ctx.db.get(args.equipmentId);
    if (!equipment) {
      throw new Error("Equipment not found");
    }

    if (equipment.status !== "active") {
      throw new Error("Equipment is not available for reservation");
    }

    if (equipment.availableQuantity < 1) {
      throw new Error("No equipment available");
    }

    // Check for overlapping reservations
    const overlapping = await ctx.db
      .query("equipmentReservations")
      .withIndex("by_equipment", (q) => q.eq("equipmentId", args.equipmentId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "confirmed"),
          q.or(
            q.and(
              q.gte(q.field("startTime"), args.startTime),
              q.lt(q.field("startTime"), args.endTime)
            ),
            q.and(
              q.gt(q.field("endTime"), args.startTime),
              q.lte(q.field("endTime"), args.endTime)
            ),
            q.and(
              q.lte(q.field("startTime"), args.startTime),
              q.gte(q.field("endTime"), args.endTime)
            )
          )
        )
      )
      .first();

    if (overlapping) {
      throw new Error("Equipment already reserved for this time slot");
    }

    const reservationId = await ctx.db.insert("equipmentReservations", {
      equipmentId: args.equipmentId,
      userId: user._id,
      clerkId: identity.subject,
      locationId: args.locationId,
      startTime: args.startTime,
      endTime: args.endTime,
      status: "confirmed",
      notes: args.notes,
      createdAt: Date.now(),
    });

    // Update equipment availability
    await ctx.db.patch(args.equipmentId, {
      availableQuantity: equipment.availableQuantity - 1,
      inUseQuantity: equipment.inUseQuantity + 1,
    });

    return reservationId;
  },
});

// Get available equipment for a location
export const getAvailableEquipment = query({
  args: {
    locationId: v.id("organizations"),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all active equipment
    const equipment = await ctx.db
      .query("inventory")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Filter by category if provided
    const filtered = args.category
      ? equipment.filter((item) => item.category === args.category)
      : equipment;

    // Get current reservations to calculate availability
    const now = Date.now();
    const reservations = await ctx.db
      .query("equipmentReservations")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "confirmed"),
          q.gte(q.field("endTime"), now)
        )
      )
      .collect();

    // Calculate available count for each equipment
    const equipmentWithAvailability = filtered.map((item) => {
      const itemReservations = reservations.filter(
        (r) => r.equipmentId === item._id
      );
      const reservedCount = itemReservations.length;
      const available = Math.max(0, item.availableQuantity - reservedCount);

      return {
        ...item,
        availableForReservation: available,
      };
    });

    return equipmentWithAvailability.filter((item) => item.availableForReservation > 0);
  },
});

// Get user's equipment reservations
export const getUserReservations = query({
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

    const reservations = await ctx.db
      .query("equipmentReservations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Get equipment details
    const reservationsWithEquipment = await Promise.all(
      reservations.map(async (reservation) => {
        const equipment = await ctx.db.get(reservation.equipmentId);
        const location = await ctx.db.get(reservation.locationId);
        return {
          ...reservation,
          equipment: equipment
            ? {
                name: equipment.name,
                category: equipment.category,
                imageUrl: equipment.imageUrl,
              }
            : null,
          location: location
            ? {
                name: location.name,
                address: location.address,
              }
            : null,
        };
      })
    );

    return reservationsWithEquipment;
  },
});

// Cancel equipment reservation
export const cancelReservation = mutation({
  args: {
    reservationId: v.id("equipmentReservations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) {
      throw new Error("Reservation not found");
    }

    if (reservation.clerkId !== identity.subject) {
      throw new Error("Not authorized");
    }

    if (reservation.status === "cancelled" || reservation.status === "completed") {
      throw new Error("Cannot cancel this reservation");
    }

    // Update reservation status
    await ctx.db.patch(args.reservationId, {
      status: "cancelled",
    });

    // Update equipment availability
    const equipment = await ctx.db.get(reservation.equipmentId);
    if (equipment) {
      await ctx.db.patch(reservation.equipmentId, {
        availableQuantity: equipment.availableQuantity + 1,
        inUseQuantity: Math.max(0, equipment.inUseQuantity - 1),
      });
    }

    return { success: true };
  },
});

// Complete equipment reservation (check-in)
export const completeReservation = mutation({
  args: {
    reservationId: v.id("equipmentReservations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) {
      throw new Error("Reservation not found");
    }

    if (reservation.clerkId !== identity.subject) {
      throw new Error("Not authorized");
    }

    if (reservation.status !== "confirmed" && reservation.status !== "in_use") {
      throw new Error("Invalid reservation status");
    }

    await ctx.db.patch(args.reservationId, {
      status: "completed",
    });

    // Update equipment availability
    const equipment = await ctx.db.get(reservation.equipmentId);
    if (equipment) {
      await ctx.db.patch(reservation.equipmentId, {
        availableQuantity: equipment.availableQuantity + 1,
        inUseQuantity: Math.max(0, equipment.inUseQuantity - 1),
      });
    }

    return { success: true };
  },
});
