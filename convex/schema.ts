import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
    role: v.optional(v.union(v.literal("superadmin"), v.literal("admin"), v.literal("trainer"), v.literal("user"))),
    accountType: v.optional(v.union(v.literal("personal"), v.literal("organization"))), // personal = member, organization = location admin
    organizationId: v.optional(v.id("organizations")), // If part of an organization
    organizationRole: v.optional(v.union(v.literal("org_admin"), v.literal("org_member"))), // Role within organization
    referralCode: v.optional(v.string()), // Unique referral code for this user
    referredBy: v.optional(v.id("users")), // User who referred this user
    referralCodeUsed: v.optional(v.string()), // The referral code they used when signing up
    phoneNumber: v.optional(v.string()), // User's phone number for SMS
    timezone: v.optional(v.string()), // User's timezone (e.g., "Australia/Melbourne")
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_organization", ["organizationId"])
    .index("by_account_type", ["accountType"])
    .index("by_referral_code", ["referralCode"])
    .index("by_referred_by", ["referredBy"]),

  organizations: defineTable({
    clerkOrganizationId: v.string(), // Clerk organization ID
    name: v.string(), // Location/franchise name (e.g., "Derrimut 24:7 Gym - Derrimut")
    slug: v.string(), // URL-friendly identifier (e.g., "derrimut-derrimut")
    type: v.union(v.literal("location"), v.literal("franchise")), // Location or franchise
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending")),
    
    // Location Details
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(), // VIC, SA, etc.
      postcode: v.string(),
      country: v.string(), // "Australia"
    }),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    
    // Business Details
    openingHours: v.optional(v.object({
      monday: v.optional(v.string()), // "00:00-23:59" for 24/7
      tuesday: v.optional(v.string()),
      wednesday: v.optional(v.string()),
      thursday: v.optional(v.string()),
      friday: v.optional(v.string()),
      saturday: v.optional(v.string()),
      sunday: v.optional(v.string()),
    })),
    is24Hours: v.boolean(), // True for 24/7 access
    
    // Features Available at This Location
    features: v.array(v.string()), // ["group_fitness", "personal_trainer", "supplement_store", "sauna", "basketball_court"]
    
    // Admin/Management
    adminId: v.id("users"), // Primary admin for this location
    adminClerkId: v.string(),
    
    // Membership & Stats
    totalMembers: v.number(), // Count of members at this location
    totalStaff: v.number(), // Count of staff at this location
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_clerk_org_id", ["clerkOrganizationId"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_admin", ["adminId"])
    .index("by_state", ["address.state"]),

  trainerApplications: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    experience: v.string(),
    certifications: v.string(),
    motivation: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  }).index("by_user", ["userId"]).index("by_status", ["status"]),

  marketplaceItems: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.union(
      v.literal("supplements"),
      v.literal("equipment"),
      v.literal("apparel"),
      v.literal("accessories"),
      v.literal("nutrition")
    ),
    imageUrl: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive")),
    stock: v.number(),
    featured: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  }).index("by_category", ["category"]).index("by_status", ["status"]).index("by_featured", ["featured"]),

  plans: defineTable({
    userId: v.string(),
    name: v.string(),
    workoutPlan: v.object({
      schedule: v.array(v.string()),
      exercises: v.array(
        v.object({
          day: v.string(),
          routines: v.array(
            v.object({
              name: v.string(),
              sets: v.optional(v.number()),
              reps: v.optional(v.number()),
              duration: v.optional(v.string()),
              description: v.optional(v.string()),
              exercises: v.optional(v.array(v.string())),
            })
          ),
        })
      ),
    }),
    dietPlan: v.object({
      dailyCalories: v.number(),
      meals: v.array(
        v.object({
          name: v.string(),
          foods: v.array(v.string()),
        })
      ),
    }),
    isActive: v.boolean(),
  })
    .index("by_user_id", ["userId"])
    .index("by_active", ["isActive"]),

  recipes: defineTable({
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    category: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack"),
      v.literal("pre-workout"),
      v.literal("post-workout"),
      v.literal("protein"),
      v.literal("healthy")
    ),
    cookingTime: v.number(), // in minutes
    servings: v.number(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    calories: v.number(),
    protein: v.number(), // in grams
    carbs: v.number(), // in grams
    fats: v.number(), // in grams
    ingredients: v.array(
      v.object({
        name: v.string(),
        amount: v.string(),
        unit: v.optional(v.string()),
      })
    ),
    instructions: v.array(v.string()),
    tags: v.array(v.string()),
    rating: v.optional(v.number()), // Rating out of 5
    isRecommended: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_category", ["category"])
    .index("by_recommended", ["isRecommended"])
    .index("by_difficulty", ["difficulty"])
    .index("by_created_at", ["createdAt"]),

  memberships: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    membershipType: v.union(
      v.literal("18-month-minimum"),
      v.literal("12-month-minimum"),
      v.literal("no-lock-in"),
      v.literal("12-month-upfront")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("pending")
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_subscription", ["stripeSubscriptionId"])
    .index("by_status", ["status"]),

  membershipPlans: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(), // in AUD
    currency: v.string(),
    type: v.union(
      v.literal("18-month-minimum"),
      v.literal("12-month-minimum"),
      v.literal("no-lock-in"),
      v.literal("12-month-upfront")
    ),
    stripePriceId: v.string(),
    stripeProductId: v.string(),
    features: v.array(v.string()),
    isActive: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_active", ["isActive"])
    .index("by_sort_order", ["sortOrder"]),

  trainerProfiles: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    bio: v.string(),
    specializations: v.array(v.string()), // ["personal_training", "zumba", "yoga", "crossfit", "cardio", "strength"]
    experience: v.string(),
    certifications: v.array(v.string()),
    hourlyRate: v.number(),
    profileImage: v.optional(v.string()),
    isActive: v.boolean(),
    rating: v.number(), // Average rating
    totalReviews: v.number(),
    totalSessions: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_active", ["isActive"])
    .index("by_rating", ["rating"])
    .index("by_specializations", ["specializations"]),

  trainerAvailability: defineTable({
    trainerId: v.id("trainerProfiles"),
    dayOfWeek: v.union(
      v.literal("monday"),
      v.literal("tuesday"),
      v.literal("wednesday"),
      v.literal("thursday"),
      v.literal("friday"),
      v.literal("saturday"),
      v.literal("sunday")
    ),
    startTime: v.string(), // "09:00"
    endTime: v.string(), // "17:00"
    isRecurring: v.boolean(), // true for weekly recurring availability
    specificDate: v.optional(v.string()), // "2025-08-20" for one-time availability
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_trainer", ["trainerId"])
    .index("by_day", ["dayOfWeek"])
    .index("by_active", ["isActive"])
    .index("by_date", ["specificDate"]),

  bookings: defineTable({
    userId: v.id("users"),
    trainerId: v.id("trainerProfiles"),
    userClerkId: v.string(),
    trainerClerkId: v.string(),
    sessionType: v.union(
      v.literal("personal_training"),
      v.literal("zumba"),
      v.literal("yoga"),
      v.literal("crossfit"),
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("nutrition_consultation"),
      v.literal("group_class")
    ),
    sessionDate: v.string(), // "2025-08-20"
    startTime: v.string(), // "14:00"
    endTime: v.string(), // "15:00"
    duration: v.number(), // in minutes
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
      v.literal("no_show")
    ),
    notes: v.optional(v.string()),
    totalAmount: v.number(),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("refunded"),
      v.literal("included_with_membership")
    ),
    paymentSessionId: v.optional(v.string()), // Stripe session ID
    cancellationReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_trainer", ["trainerId"])
    .index("by_user_clerk", ["userClerkId"])
    .index("by_trainer_clerk", ["trainerClerkId"])
    .index("by_date", ["sessionDate"])
    .index("by_status", ["status"])
    .index("by_session_type", ["sessionType"])
    .index("by_datetime", ["sessionDate", "startTime"]),

  trainerReviews: defineTable({
    bookingId: v.id("bookings"),
    userId: v.id("users"),
    trainerId: v.id("trainerProfiles"),
    rating: v.number(), // 1-5 stars
    comment: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_booking", ["bookingId"])
    .index("by_trainer", ["trainerId"])
    .index("by_user", ["userId"])
    .index("by_rating", ["rating"]),

  cartItems: defineTable({
    userId: v.id("users"),
    userClerkId: v.string(),
    productId: v.id("marketplaceItems"),
    quantity: v.number(),
    priceAtTime: v.number(), // Price when added to cart in AUD
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_clerk", ["userClerkId"])
    .index("by_user_product", ["userClerkId", "productId"])
    .index("by_user", ["userId"]),

  orders: defineTable({
    userId: v.id("users"),
    userClerkId: v.string(),
    orderNumber: v.string(), // Auto-generated order number
    items: v.array(
      v.object({
        productId: v.id("marketplaceItems"),
        productName: v.string(),
        quantity: v.number(),
        pricePerItem: v.number(), // Price in AUD at time of order
        totalPrice: v.number(), // quantity * pricePerItem
      })
    ),
    subtotal: v.number(), // Sum of all item totals in AUD
    shippingCost: v.number(), // Shipping cost in AUD
    tax: v.number(), // Tax amount in AUD
    totalAmount: v.number(), // Final total in AUD
    currency: v.string(), // "AUD"
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    stripeSessionId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    shippingAddress: v.object({
      name: v.string(),
      phone: v.string(),
      addressLine1: v.string(),
      addressLine2: v.optional(v.string()),
      city: v.string(),
      postalCode: v.string(),
      country: v.string(),
      email: v.optional(v.string()), // Add email field to match what Stripe sends
    }),
    estimatedDelivery: v.optional(v.number()),
    trackingNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_clerk", ["userClerkId"])
    .index("by_order_number", ["orderNumber"])
    .index("by_status", ["status"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_stripe_session", ["stripeSessionId"]),

  blogPosts: defineTable({
    title: v.string(),
    slug: v.string(), // URL-friendly version of title
    excerpt: v.string(), // Short description
    content: v.string(), // Full article content (HTML/Markdown)
    featuredImage: v.optional(v.string()), // URL to featured image
    category: v.union(
      v.literal("workout-tips"),
      v.literal("nutrition"),
      v.literal("success-stories"),
      v.literal("trainer-insights"),
      v.literal("equipment-guides"),
      v.literal("wellness"),
      v.literal("news")
    ),
    tags: v.array(v.string()), // Array of tags
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    authorId: v.id("users"), // Author (admin or trainer)
    authorName: v.string(), // Cached author name
    authorImage: v.optional(v.string()), // Cached author image
    readTime: v.number(), // Estimated read time in minutes
    views: v.number(), // View count
    likes: v.number(), // Like count
    isFeatured: v.boolean(), // Featured on homepage
    publishedAt: v.optional(v.number()), // When published
    seoTitle: v.optional(v.string()), // SEO optimized title
    seoDescription: v.optional(v.string()), // Meta description
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_author", ["authorId"])
    .index("by_slug", ["slug"])
    .index("by_featured", ["isFeatured"])
    .index("by_published", ["publishedAt"])
    .index("by_views", ["views"]),

  blogComments: defineTable({
    postId: v.id("blogPosts"),
    userId: v.id("users"),
    userClerkId: v.string(),
    userName: v.string(), // Cached user name
    userImage: v.optional(v.string()), // Cached user image
    content: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    parentCommentId: v.optional(v.id("blogComments")), // For nested comments
    likes: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_user", ["userId"])
    .index("by_user_clerk", ["userClerkId"])
    .index("by_status", ["status"])
    .index("by_parent", ["parentCommentId"]),

  blogLikes: defineTable({
    postId: v.optional(v.id("blogPosts")),
    commentId: v.optional(v.id("blogComments")),
    userId: v.id("users"),
    userClerkId: v.string(),
    type: v.union(v.literal("post"), v.literal("comment")),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_comment", ["commentId"])
    .index("by_user", ["userId"])
    .index("by_user_clerk", ["userClerkId"])
    .index("by_type", ["type"]),

  newsletter: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    status: v.union(
      v.literal("subscribed"),
      v.literal("unsubscribed"),
      v.literal("pending")
    ),
    source: v.string(), // Where they subscribed from
    subscribedAt: v.number(),
    unsubscribedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    status: v.union(v.literal("new"), v.literal("read"), v.literal("responded")),
    submittedAt: v.number(),
    readAt: v.optional(v.number()),
    respondedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_submitted_at", ["submittedAt"]),

  // Salary Management System
  salaryStructures: defineTable({
    employeeId: v.id("users"),
    employeeClerkId: v.string(),
    employeeName: v.string(), // Cached for quick display
    employeeRole: v.string(), // "admin", "trainer", "user"
    
    // Basic salary information
    baseSalary: v.number(),
    currency: v.literal("AUD"),
    paymentFrequency: v.union(
      v.literal("monthly"), 
      v.literal("bi-weekly"), 
      v.literal("weekly")
    ),
    effectiveDate: v.number(),
    status: v.union(
      v.literal("active"), 
      v.literal("inactive"), 
      v.literal("pending")
    ),
    
    // Performance-based earnings
    performanceBonus: v.optional(v.number()),
    membershipCommissionRate: v.optional(v.number()), // Percentage for membership sales
    trainerSessionRate: v.optional(v.number()), // Per session rate for trainers
    overtimeRate: v.optional(v.number()), // Per hour overtime rate
    
    // Allowances
    allowances: v.array(v.object({
      type: v.string(), // "transport", "meal", "housing", "phone"
      amount: v.number(),
      isPercentage: v.boolean(),
    })),
    
    // Standard deductions
    deductions: v.array(v.object({
      type: v.string(), // "tax", "epf", "etf", "insurance", "loan"
      amount: v.number(),
      isPercentage: v.boolean(),
    })),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_employee", ["employeeId"])
    .index("by_employee_clerk", ["employeeClerkId"])
    .index("by_status", ["status"])
    .index("by_role", ["employeeRole"])
    .index("by_effective_date", ["effectiveDate"]),

  payrollRecords: defineTable({
    employeeId: v.id("users"),
    employeeClerkId: v.string(),
    employeeName: v.string(), // Cached for display
    employeeRole: v.string(),
    
    // Payroll period
    payrollPeriod: v.object({
      startDate: v.number(),
      endDate: v.number(),
      month: v.string(), // "January", "February", etc.
      year: v.number(),
      periodLabel: v.string(), // "January 2025", "Week 1 Jan 2025"
    }),
    
    // Detailed earnings breakdown
    earnings: v.object({
      baseSalary: v.number(),
      performanceBonus: v.number(),
      membershipCommissions: v.number(),
      sessionEarnings: v.number(), // For trainers
      overtimeEarnings: v.number(),
      allowances: v.number(),
      totalEarnings: v.number(),
    }),
    
    // Detailed deductions breakdown
    deductions: v.object({
      incomeTax: v.number(), // PAYE tax (Sri Lanka)
      epfEmployee: v.number(), // Employee Provident Fund - Employee (8%)
      epfEmployer: v.number(), // Employee Provident Fund - Employer (12%)
      etfEmployer: v.number(), // Employee Trust Fund - Employer (3%)
      insurance: v.number(),
      loanDeductions: v.number(),
      advanceDeductions: v.number(),
      otherDeductions: v.number(),
      totalDeductions: v.number(),
    }),
    
    // Final calculations
    netSalary: v.number(),
    totalEmployerCost: v.number(), // Including employer contributions
    
    // Workflow status
    status: v.union(
      v.literal("draft"), 
      v.literal("pending_approval"),
      v.literal("approved"), 
      v.literal("paid"), 
      v.literal("cancelled")
    ),
    
    // Approval workflow
    createdBy: v.id("users"),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    
    // Payment details
    paymentMethod: v.optional(v.string()), // "bank_transfer", "cash", "cheque"
    paymentReference: v.optional(v.string()),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_employee_clerk", ["employeeClerkId"])
    .index("by_period", ["payrollPeriod.year", "payrollPeriod.month"])
    .index("by_status", ["status"])
    .index("by_created_date", ["createdAt"])
    .index("by_paid_date", ["paidAt"]),

  salaryAdvances: defineTable({
    employeeId: v.id("users"),
    employeeClerkId: v.string(),
    employeeName: v.string(),
    employeeRole: v.string(),
    
    // Advance details
    requestedAmount: v.number(),
    approvedAmount: v.optional(v.number()),
    reason: v.string(),
    urgency: v.union(
      v.literal("low"), 
      v.literal("medium"), 
      v.literal("high"), 
      v.literal("emergency")
    ),
    
    // Repayment terms
    repaymentPeriodMonths: v.number(),
    monthlyDeductionAmount: v.number(),
    remainingBalance: v.number(),
    
    // Status and workflow
    status: v.union(
      v.literal("pending"),
      v.literal("approved"), 
      v.literal("rejected"), 
      v.literal("paid"),
      v.literal("repaying"), 
      v.literal("completed"),
      v.literal("cancelled")
    ),
    
    // Workflow tracking
    requestedBy: v.id("users"),
    requestedAt: v.number(),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    
    // Comments and notes
    employeeNotes: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_employee_clerk", ["employeeClerkId"])
    .index("by_status", ["status"])
    .index("by_urgency", ["urgency"])
    .index("by_request_date", ["requestedAt"]),

  salaryAdjustments: defineTable({
    employeeId: v.id("users"),
    employeeClerkId: v.string(),
    employeeName: v.string(),
    
    // Adjustment details
    adjustmentType: v.union(
      v.literal("salary_increase"),
      v.literal("salary_decrease"),
      v.literal("promotion"),
      v.literal("bonus"),
      v.literal("penalty"),
      v.literal("allowance_change")
    ),
    
    // Financial impact
    previousAmount: v.number(),
    newAmount: v.number(),
    adjustmentAmount: v.number(), // Positive or negative
    adjustmentPercentage: v.number(),
    
    // Timing
    effectiveDate: v.number(),
    isOneTime: v.boolean(), // One-time adjustment or permanent change
    
    // Justification
    reason: v.string(),
    description: v.optional(v.string()),
    performanceScore: v.optional(v.number()), // 1-5 rating if performance-based
    
    // Approval workflow
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("applied")
    ),
    
    requestedBy: v.id("users"),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_type", ["adjustmentType"])
    .index("by_status", ["status"])
    .index("by_effective_date", ["effectiveDate"]),

  attendanceRecords: defineTable({
    employeeId: v.id("users"),
    employeeClerkId: v.string(),
    employeeName: v.string(),
    
    // Date and timing
    date: v.string(), // "YYYY-MM-DD" format
    checkIn: v.optional(v.number()), // Timestamp
    checkOut: v.optional(v.number()), // Timestamp
    breakStart: v.optional(v.number()),
    breakEnd: v.optional(v.number()),
    
    // Calculated hours
    hoursWorked: v.number(),
    overtimeHours: v.number(),
    breakHours: v.number(),
    
    // Status
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("late"),
      v.literal("half_day"),
      v.literal("leave")
    ),
    
    leaveType: v.optional(v.union(
      v.literal("sick"),
      v.literal("annual"),
      v.literal("personal"),
      v.literal("emergency")
    )),
    
    // Notes
    notes: v.optional(v.string()),
    approvedBy: v.optional(v.id("users")),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_employee_clerk", ["employeeClerkId"])
    .index("by_date", ["date"])
    .index("by_status", ["status"])
    .index("by_employee_date", ["employeeId", "date"]),

  // Generated Reports Tracking
  generatedReports: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("payroll"), v.literal("advances"), v.literal("tax"), v.literal("comparative")),
    dateRange: v.string(),
    status: v.union(v.literal("generated"), v.literal("generating"), v.literal("scheduled")),
    fileSize: v.optional(v.string()),
    fileName: v.optional(v.string()),
    generatedBy: v.id("users"),
    generatedAt: v.number(),
    parameters: v.object({
      year: v.optional(v.number()),
      month: v.optional(v.string()),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
    }),
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_generated_by", ["generatedBy"])
    .index("by_generated_date", ["generatedAt"]),

  // Inventory Management for Gym Equipment
  inventory: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("free_weights"),
      v.literal("functional"),
      v.literal("accessories"),
      v.literal("safety"),
      v.literal("cleaning"),
      v.literal("maintenance")
    ),
    manufacturer: v.optional(v.string()),
    model: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    
    // Quantity and Availability
    totalQuantity: v.number(),
    availableQuantity: v.number(),
    inUseQuantity: v.number(),
    maintenanceQuantity: v.number(),
    
    // Condition and Status
    condition: v.union(
      v.literal("excellent"),
      v.literal("good"),
      v.literal("fair"),
      v.literal("poor"),
      v.literal("out_of_order")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("maintenance"),
      v.literal("retired")
    ),
    
    // Purchase Information
    purchaseDate: v.optional(v.number()),
    purchasePrice: v.optional(v.number()),
    vendor: v.optional(v.string()),
    warrantyExpiry: v.optional(v.number()),
    
    // Location and Assignment
    location: v.optional(v.string()),
    zone: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    
    // Maintenance
    lastMaintenanceDate: v.optional(v.number()),
    nextMaintenanceDate: v.optional(v.number()),
    maintenanceNotes: v.optional(v.string()),
    
    // Alerts and Thresholds
    minQuantityAlert: v.optional(v.number()),
    maxCapacity: v.optional(v.number()),
    
    // Usage Tracking
    usageCount: v.optional(v.number()),
    lastUsedDate: v.optional(v.number()),
    
    // Images and Documentation
    imageUrl: v.optional(v.string()),
    manualUrl: v.optional(v.string()),
    
    // Tags for flexible categorization
    tags: v.optional(v.array(v.string())),
    
    // Notes and Additional Info
    notes: v.optional(v.string()),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
    updatedBy: v.id("users"),
  })
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_condition", ["condition"])
    .index("by_location", ["location"])
    .index("by_zone", ["zone"])
    .index("by_assigned_to", ["assignedTo"])
    .index("by_created_date", ["createdAt"])
    .index("by_maintenance_date", ["nextMaintenanceDate"])
    .index("by_purchase_date", ["purchaseDate"]),

  // Webhook event tracking for idempotency
  webhookEvents: defineTable({
    eventId: v.string(), // Stripe event ID (evt_xxx) or Clerk event ID
    eventType: v.string(), // Event type (e.g., "customer.subscription.created")
    processed: v.boolean(), // Whether event has been processed
    processedAt: v.optional(v.number()), // Timestamp when processed
    error: v.optional(v.string()), // Error message if processing failed
    createdAt: v.number(),
  })
    .index("by_event_id", ["eventId"])
    .index("by_processed", ["processed"])
    .index("by_event_type", ["eventType"]),

  // Member Check-ins (QR Code & App-based)
  memberCheckIns: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    locationId: v.id("organizations"),
    checkInTime: v.number(),
    checkOutTime: v.optional(v.number()),
    duration: v.optional(v.number()), // in minutes
    qrCode: v.string(), // Unique QR code for this check-in
    method: v.union(v.literal("qr"), v.literal("app"), v.literal("manual")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_location", ["locationId"])
    .index("by_date", ["checkInTime"])
    .index("by_user_date", ["clerkId", "checkInTime"]),

  // Achievements & Badges
  achievements: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    type: v.union(
      v.literal("check_in_streak"),
      v.literal("total_check_ins"),
      v.literal("workout_completed"),
      v.literal("challenge_completed"),
      v.literal("milestone"),
      v.literal("social")
    ),
    title: v.string(),
    description: v.string(),
    icon: v.string(), // Icon name/emoji
    unlockedAt: v.number(),
    metadata: v.optional(v.any()), // Additional data
  })
    .index("by_user", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_type", ["type"]),

  // Challenges & Competitions
  challenges: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("check_in"),
      v.literal("workout"),
      v.literal("social"),
      v.literal("streak")
    ),
    goal: v.number(), // Target number
    startDate: v.number(),
    endDate: v.number(),
    reward: v.optional(v.string()),
    isActive: v.boolean(),
    participants: v.array(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_dates", ["startDate", "endDate"]),

  // Challenge Participations
  challengeParticipations: defineTable({
    challengeId: v.id("challenges"),
    userId: v.id("users"),
    clerkId: v.string(),
    progress: v.number(),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    joinedAt: v.number(),
  })
    .index("by_challenge", ["challengeId"])
    .index("by_user", ["userId"])
    .index("by_challenge_user", ["challengeId", "userId"]),

  // Equipment Reservations
  equipmentReservations: defineTable({
    equipmentId: v.id("inventory"),
    userId: v.id("users"),
    clerkId: v.string(),
    locationId: v.id("organizations"),
    startTime: v.number(),
    endTime: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("in_use"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_equipment", ["equipmentId"])
    .index("by_user", ["userId"])
    .index("by_location", ["locationId"])
    .index("by_status", ["status"])
    .index("by_time", ["startTime", "endTime"]),

  // Group Fitness Classes
  groupClasses: defineTable({
    name: v.string(),
    description: v.string(),
    instructorId: v.id("users"),
    instructorClerkId: v.string(),
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
    duration: v.number(), // in minutes
    startTime: v.number(),
    endTime: v.number(),
    recurring: v.union(
      v.literal("none"),
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
    dayOfWeek: v.optional(v.number()), // 0-6 for weekly
    isActive: v.boolean(),
    attendees: v.array(v.id("users")),
    waitlist: v.array(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_instructor", ["instructorId"])
    .index("by_location", ["locationId"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .index("by_time", ["startTime"]),

  // Class Bookings
  classBookings: defineTable({
    classId: v.id("groupClasses"),
    userId: v.id("users"),
    clerkId: v.string(),
    status: v.union(
      v.literal("booked"),
      v.literal("attended"),
      v.literal("no_show"),
      v.literal("cancelled")
    ),
    bookedAt: v.number(),
    attendedAt: v.optional(v.number()),
  })
    .index("by_class", ["classId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Member Engagement Scores
  memberEngagement: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    score: v.number(), // 0-100
    checkInCount: v.number(),
    checkInStreak: v.number(),
    lastCheckIn: v.optional(v.number()),
    workoutCompletions: v.number(),
    challengeCompletions: v.number(),
    socialInteractions: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_score", ["score"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    type: v.union(
      v.literal("achievement"),
      v.literal("challenge"),
      v.literal("class_reminder"),
      v.literal("booking"),
      v.literal("system"),
      v.literal("social")
    ),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_read", ["read"])
    .index("by_created", ["createdAt"]),

  // Community Posts
  communityPosts: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    content: v.string(),
    images: v.optional(v.array(v.string())),
    type: v.union(
      v.literal("progress"),
      v.literal("workout"),
      v.literal("achievement"),
      v.literal("question"),
      v.literal("general")
    ),
    likes: v.array(v.id("users")),
    comments: v.array(v.id("communityComments")),
    locationId: v.optional(v.id("organizations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_location", ["locationId"])
    .index("by_created", ["createdAt"]),

  // Community Comments
  communityComments: defineTable({
    postId: v.id("communityPosts"),
    userId: v.id("users"),
    clerkId: v.string(),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_user", ["userId"]),

  // Referrals System
  referrals: defineTable({
    referrerId: v.id("users"), // User who made the referral
    referrerClerkId: v.string(),
    refereeId: v.id("users"), // User who was referred
    refereeClerkId: v.string(),
    referralCode: v.string(), // The code that was used
    status: v.union(
      v.literal("pending"), // Referral made but not yet converted
      v.literal("converted"), // Referee signed up for membership
      v.literal("rewarded"), // Rewards have been given
      v.literal("expired") // Referral expired without conversion
    ),
    conversionDate: v.optional(v.number()), // When referee became a member
    rewardAmount: v.optional(v.number()), // Reward amount in AUD
    rewardType: v.optional(v.union(
      v.literal("discount"), // Percentage or fixed discount
      v.literal("free_month"), // Free month of membership
      v.literal("cashback"), // Cash back reward
      v.literal("points") // Loyalty points
    )),
    referrerReward: v.optional(v.number()), // Reward for referrer
    refereeReward: v.optional(v.number()), // Reward for referee (new member)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_referrer", ["referrerId"])
    .index("by_referrer_clerk", ["referrerClerkId"])
    .index("by_referee", ["refereeId"])
    .index("by_referee_clerk", ["refereeClerkId"])
    .index("by_code", ["referralCode"])
    .index("by_status", ["status"])
    .index("by_referrer_status", ["referrerId", "status"]),

  // Loyalty Points System
  loyaltyPoints: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    points: v.number(), // Current balance
    totalEarned: v.number(), // Lifetime points earned
    totalRedeemed: v.number(), // Lifetime points redeemed
    lastUpdated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk_id", ["clerkId"]),

  // Loyalty Point Transactions
  loyaltyTransactions: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    type: v.union(
      v.literal("earned"), // Points earned
      v.literal("redeemed"), // Points redeemed
      v.literal("expired"), // Points expired
      v.literal("adjusted") // Manual adjustment
    ),
    amount: v.number(), // Positive for earned, negative for redeemed
    balance: v.number(), // Balance after this transaction
    source: v.union(
      v.literal("check_in"),
      v.literal("referral"),
      v.literal("purchase"),
      v.literal("challenge"),
      v.literal("achievement"),
      v.literal("redemption"),
      v.literal("admin_adjustment")
    ),
    description: v.string(),
    expiresAt: v.optional(v.number()), // When points expire (if applicable)
    relatedId: v.optional(v.string()), // ID of related entity (referral, purchase, etc.)
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_type", ["type"])
    .index("by_source", ["source"])
    .index("by_created", ["createdAt"]),

  // Push Notification Subscriptions
  pushSubscriptions: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    endpoint: v.string(), // Push subscription endpoint
    keys: v.object({
      p256dh: v.string(), // Public key
      auth: v.string(), // Auth secret
    }),
    userAgent: v.optional(v.string()),
    deviceType: v.optional(v.union(v.literal("browser"), v.literal("mobile"))),
    preferences: v.object({
      achievements: v.boolean(),
      challenges: v.boolean(),
      classReminders: v.boolean(),
      bookings: v.boolean(),
      streakReminders: v.boolean(),
      workoutReminders: v.boolean(),
      specialOffers: v.boolean(),
      social: v.boolean(),
    }),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_endpoint", ["endpoint"])
    .index("by_active", ["isActive"]),

  // SMS Subscriptions
  smsSubscriptions: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    phoneNumber: v.string(),
    preferences: v.object({
      bookingConfirmations: v.boolean(),
      classReminders: v.boolean(),
      paymentAlerts: v.boolean(),
      accountUpdates: v.boolean(),
      emergencyNotifications: v.boolean(),
    }),
    isActive: v.boolean(),
    verified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_phone", ["phoneNumber"])
    .index("by_active", ["isActive"]),

  // Friendships
  friendships: defineTable({
    userId: v.id("users"),
    friendId: v.id("users"),
    userClerkId: v.string(),
    friendClerkId: v.string(),
    status: v.union(
      v.literal("pending"), // Friend request sent
      v.literal("accepted"), // Friends
      v.literal("blocked") // Blocked
    ),
    requestedBy: v.id("users"), // Who sent the request
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_friend", ["friendId"])
    .index("by_user_clerk", ["userClerkId"])
    .index("by_friend_clerk", ["friendClerkId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"])
    .index("by_friend_status", ["friendId", "status"]),

  // Groups & Communities
  groups: defineTable({
    name: v.string(),
    description: v.string(),
    creatorId: v.id("users"),
    creatorClerkId: v.string(),
    locationId: v.optional(v.id("organizations")),
    category: v.union(
      v.literal("location"), // Group by location
      v.literal("interest"), // Group by interest
      v.literal("goal"), // Group by fitness goal
      v.literal("general") // General community group
    ),
    interest: v.optional(v.string()), // e.g., "powerlifting", "running", "yoga"
    goal: v.optional(v.string()), // e.g., "weight_loss", "muscle_gain"
    isPublic: v.boolean(), // Public vs private group
    memberCount: v.number(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_location", ["locationId"])
    .index("by_category", ["category"])
    .index("by_public", ["isPublic"])
    .index("by_interest", ["interest"])
    .index("by_goal", ["goal"]),

  // Group Memberships
  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    clerkId: v.string(),
    role: v.union(
      v.literal("admin"), // Group admin
      v.literal("moderator"), // Group moderator
      v.literal("member") // Regular member
    ),
    joinedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_clerk", ["clerkId"])
    .index("by_group_user", ["groupId", "userId"]),

  // Group Challenges
  groupChallenges: defineTable({
    groupId: v.id("groups"),
    challengeId: v.id("challenges"),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_challenge", ["challengeId"]),

  // Events & Meetups
  events: defineTable({
    title: v.string(),
    description: v.string(),
    organizerId: v.id("users"),
    organizerClerkId: v.string(),
    groupId: v.optional(v.id("groups")), // If event is part of a group
    locationId: v.optional(v.id("organizations")),
    eventType: v.union(
      v.literal("workshop"), // Fitness workshop
      v.literal("seminar"), // Nutrition seminar
      v.literal("social"), // Member social event
      v.literal("competition"), // Competition
      v.literal("charity"), // Charity event
      v.literal("class") // Special class
    ),
    startDate: v.number(),
    endDate: v.number(),
    capacity: v.optional(v.number()), // Max attendees
    isPublic: v.boolean(),
    image: v.optional(v.string()),
    locationDetails: v.optional(v.string()), // Additional location info
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organizer", ["organizerId"])
    .index("by_group", ["groupId"])
    .index("by_location", ["locationId"])
    .index("by_type", ["eventType"])
    .index("by_date", ["startDate"])
    .index("by_public", ["isPublic"]),

  // Event RSVPs
  eventRSVPs: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    clerkId: v.string(),
    status: v.union(
      v.literal("going"), // Attending
      v.literal("maybe"), // Maybe attending
      v.literal("not_going") // Not attending
    ),
    rsvpDate: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_clerk", ["clerkId"])
    .index("by_event_user", ["eventId", "userId"])
    .index("by_status", ["status"]),

  // Win-Back Campaigns
  winBackCampaigns: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    type: v.union(
      v.literal("we_miss_you"), // 2 weeks inactive
      v.literal("come_back"), // 1 month inactive
      v.literal("special_return") // 3 months inactive
    ),
    daysSinceLastActivity: v.number(),
    sentAt: v.number(),
    openedAt: v.optional(v.number()),
    clickedAt: v.optional(v.number()),
    convertedAt: v.optional(v.number()), // User returned after campaign
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk", ["clerkId"])
    .index("by_type", ["type"])
    .index("by_converted", ["convertedAt"]),

  // Special Offers & Promotions
  specialOffers: defineTable({
    title: v.string(),
    description: v.string(),
    discountCode: v.optional(v.string()),
    discountPercent: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    validUntil: v.number(), // Timestamp
    link: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    targetAudience: v.union(
      v.literal("all"),
      v.literal("active_members"),
      v.literal("inactive_members"),
      v.literal("new_members")
    ),
    status: v.union(v.literal("active"), v.literal("expired"), v.literal("cancelled")),
    sentCount: v.number(),
    openedCount: v.number(),
    clickedCount: v.number(),
    createdAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_status", ["status"])
    .index("by_valid_until", ["validUntil"])
    .index("by_created", ["createdAt"]),

  // Group Chat Messages
  groupMessages: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    clerkId: v.string(),
    message: v.string(),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_clerk", ["clerkId"])
    .index("by_group_created", ["groupId", "createdAt"]),

  // Event Media (Photos/Videos)
  eventMedia: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    clerkId: v.string(),
    type: v.union(v.literal("photo"), v.literal("video")),
    url: v.string(),
    thumbnailUrl: v.optional(v.string()),
    caption: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_clerk", ["clerkId"])
    .index("by_event_created", ["eventId", "createdAt"]),

  // Group Workouts (Workouts with friends)
  groupWorkouts: defineTable({
    organizerId: v.id("users"),
    organizerClerkId: v.string(),
    title: v.string(),
    description: v.string(),
    locationId: v.id("organizations"),
    scheduledTime: v.number(),
    maxParticipants: v.optional(v.number()),
    participants: v.array(v.id("users")),
    status: v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organizer", ["organizerId"])
    .index("by_location", ["locationId"])
    .index("by_scheduled_time", ["scheduledTime"])
    .index("by_status", ["status"]),

  // Advanced Progress Tracking
  progressTracking: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    type: v.union(
      v.literal("weight"),
      v.literal("body_fat"),
      v.literal("measurement"),
      v.literal("photo"),
      v.literal("strength")
    ),
    value: v.optional(v.number()), // For weight, body fat, measurements
    unit: v.optional(v.string()), // "kg", "lbs", "cm", "inches", "%"
    measurementType: v.optional(v.string()), // "chest", "waist", "arms", etc.
    photoUrl: v.optional(v.string()),
    photoType: v.optional(v.union(v.literal("before"), v.literal("after"), v.literal("progress"))),
    notes: v.optional(v.string()),
    exerciseName: v.optional(v.string()), // For strength tracking
    exerciseData: v.optional(v.object({
      sets: v.number(),
      reps: v.number(),
      weight: v.number(),
      pr: v.optional(v.boolean()), // Personal record
    })),
    recordedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk", ["clerkId"])
    .index("by_type", ["type"])
    .index("by_user_type", ["userId", "type"])
    .index("by_recorded", ["recordedAt"]),

  // Nutrition Tracking
  nutritionEntries: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    date: v.number(), // Timestamp for the day
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack"),
      v.literal("pre_workout"),
      v.literal("post_workout")
    ),
    foodName: v.string(),
    quantity: v.number(),
    unit: v.string(), // "g", "ml", "serving", "piece"
    calories: v.number(),
    protein: v.number(), // grams
    carbs: v.number(), // grams
    fats: v.number(), // grams
    fiber: v.optional(v.number()),
    sugar: v.optional(v.number()),
    sodium: v.optional(v.number()),
    barcode: v.optional(v.string()), // For scanned products
    nutritionixId: v.optional(v.string()), // Nutritionix food ID
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk", ["clerkId"])
    .index("by_date", ["date"])
    .index("by_user_date", ["userId", "date"]),

  // Workout Logs
  workoutLogs: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    workoutName: v.string(),
    workoutDate: v.number(),
    duration: v.number(), // minutes
    exercises: v.array(v.object({
      exerciseName: v.string(),
      sets: v.array(v.object({
        reps: v.number(),
        weight: v.number(),
        restTime: v.optional(v.number()), // seconds
        notes: v.optional(v.string()),
        isPr: v.optional(v.boolean()), // Personal record
      })),
      notes: v.optional(v.string()),
    })),
    totalVolume: v.number(), // Total weight lifted
    caloriesBurned: v.optional(v.number()),
    notes: v.optional(v.string()),
    templateId: v.optional(v.id("workoutTemplates")),
    shared: v.optional(v.boolean()), // Shared to community
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk", ["clerkId"])
    .index("by_date", ["workoutDate"])
    .index("by_user_date", ["userId", "workoutDate"]),

  // Workout Templates
  workoutTemplates: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    exercises: v.array(v.object({
      exerciseName: v.string(),
      sets: v.number(),
      reps: v.number(),
      weight: v.optional(v.number()),
      restTime: v.optional(v.number()),
      notes: v.optional(v.string()),
    })),
    estimatedDuration: v.number(), // minutes
    category: v.optional(v.string()), // "strength", "cardio", "hiit", etc.
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk", ["clerkId"])
    .index("by_public", ["isPublic"]),

  // Video Workout Library
  videoWorkouts: defineTable({
    title: v.string(),
    description: v.string(),
    videoUrl: v.string(), // Vimeo/Mux URL
    thumbnailUrl: v.string(),
    duration: v.number(), // seconds
    category: v.union(
      v.literal("hiit"),
      v.literal("yoga"),
      v.literal("strength"),
      v.literal("cardio"),
      v.literal("pilates"),
      v.literal("stretching"),
      v.literal("dance"),
      v.literal("boxing")
    ),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    instructorId: v.optional(v.id("users")),
    instructorName: v.string(),
    instructorImage: v.optional(v.string()),
    caloriesBurned: v.optional(v.number()),
    equipment: v.array(v.string()), // ["dumbbells", "mat", "resistance_bands"]
    tags: v.array(v.string()),
    viewCount: v.number(),
    completionCount: v.number(),
    rating: v.number(), // Average rating 0-5
    ratingCount: v.number(),
    isFeatured: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_difficulty", ["difficulty"])
    .index("by_instructor", ["instructorId"])
    .index("by_featured", ["isFeatured"])
    .index("by_active", ["isActive"]),

  // Video Workout Views & Completions
  videoWorkoutViews: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    videoWorkoutId: v.id("videoWorkouts"),
    viewedAt: v.number(),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    progress: v.number(), // Percentage watched 0-100
    rating: v.optional(v.number()), // 1-5 stars
    review: v.optional(v.string()),
    favorited: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk", ["clerkId"])
    .index("by_video", ["videoWorkoutId"])
    .index("by_user_video", ["userId", "videoWorkoutId"]),

  // Wearable Device Data
  wearableData: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    platform: v.union(
      v.literal("apple_health"),
      v.literal("google_fit"),
      v.literal("fitbit"),
      v.literal("strava")
    ),
    dataType: v.union(
      v.literal("workout"),
      v.literal("heart_rate"),
      v.literal("steps"),
      v.literal("sleep"),
      v.literal("calories")
    ),
    date: v.number(), // Timestamp
    value: v.number(),
    unit: v.string(), // "bpm", "steps", "hours", "kcal"
    workoutType: v.optional(v.string()), // "running", "cycling", "strength", etc.
    duration: v.optional(v.number()), // seconds
    metadata: v.optional(v.string()), // JSON string for additional data
    syncedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk", ["clerkId"])
    .index("by_platform", ["platform"])
    .index("by_type", ["dataType"])
    .index("by_user_date", ["userId", "date"]),

  // Wearable Device Connections
  wearableConnections: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    platform: v.union(
      v.literal("apple_health"),
      v.literal("google_fit"),
      v.literal("fitbit"),
      v.literal("strava")
    ),
    accessToken: v.string(), // Encrypted
    refreshToken: v.optional(v.string()), // Encrypted
    platformUserId: v.string(),
    isActive: v.boolean(),
    lastSyncedAt: v.optional(v.number()),
    syncFrequency: v.union(v.literal("realtime"), v.literal("hourly"), v.literal("daily")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk", ["clerkId"])
    .index("by_platform", ["platform"])
    .index("by_user_platform", ["userId", "platform"]),

  // Predictive Analytics
  memberPredictions: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    churnRisk: v.number(), // 0-100 score
    churnRiskLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    optimalCheckInTime: v.optional(v.number()), // Hour of day (0-23)
    workoutCompletionProbability: v.number(), // 0-100
    goalAchievementTimeline: v.optional(v.number()), // Days estimated
    engagementScore: v.number(), // 0-100
    predictedNextCheckIn: v.optional(v.number()), // Timestamp
    factors: v.array(v.string()), // ["low_engagement", "missed_classes", etc.]
    calculatedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk", ["clerkId"])
    .index("by_churn_risk", ["churnRisk"])
    .index("by_risk_level", ["churnRiskLevel"]),

  // Marketing Campaigns
  marketingCampaigns: defineTable({
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("welcome_series"),
      v.literal("onboarding"),
      v.literal("re_engagement"),
      v.literal("birthday"),
      v.literal("anniversary"),
      v.literal("custom")
    ),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("paused"), v.literal("completed")),
    targetAudience: v.object({
      segment: v.union(
        v.literal("all"),
        v.literal("new_members"),
        v.literal("active_members"),
        v.literal("inactive_members"),
        v.literal("by_location"),
        v.literal("by_membership_type"),
        v.literal("custom")
      ),
      locationIds: v.optional(v.array(v.id("organizations"))),
      membershipTypes: v.optional(v.array(v.string())),
      customFilters: v.optional(v.string()), // JSON
    }),
    emails: v.array(v.object({
      subject: v.string(),
      body: v.string(), // HTML
      delay: v.number(), // Hours after trigger
      order: v.number(),
    })),
    sentCount: v.number(),
    openedCount: v.number(),
    clickedCount: v.number(),
    convertedCount: v.number(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    scheduledAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_created_by", ["createdBy"]),

  // Member Messages (In-App Messaging)
  memberMessages: defineTable({
    senderId: v.id("users"),
    senderClerkId: v.string(),
    recipientId: v.id("users"),
    recipientClerkId: v.string(),
    message: v.string(),
    messageType: v.union(
      v.literal("direct"),
      v.literal("trainer"),
      v.literal("admin"),
      v.literal("group_announcement"),
      v.literal("broadcast")
    ),
    groupId: v.optional(v.id("groups")), // For group announcements
    read: v.boolean(),
    readAt: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())), // File URLs
    createdAt: v.number(),
  })
    .index("by_sender", ["senderId"])
    .index("by_recipient", ["recipientId"])
    .index("by_sender_clerk", ["senderClerkId"])
    .index("by_recipient_clerk", ["recipientClerkId"])
    .index("by_group", ["groupId"])
    .index("by_read", ["read"])
    .index("by_created", ["createdAt"]),

  // Live Streaming Classes
  liveStreamClasses: defineTable({
    classId: v.id("groupFitnessClasses"),
    title: v.string(),
    description: v.string(),
    streamUrl: v.string(), // Zoom/Google Meet link
    streamType: v.union(v.literal("zoom"), v.literal("google_meet"), v.literal("custom")),
    startTime: v.number(),
    endTime: v.number(),
    capacity: v.number(),
    currentViewers: v.number(),
    recordingUrl: v.optional(v.string()), // For later viewing
    isLive: v.boolean(),
    hasChat: v.boolean(),
    hasReactions: v.boolean(),
    instructorId: v.id("users"),
    instructorClerkId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_class", ["classId"])
    .index("by_instructor", ["instructorId"])
    .index("by_start_time", ["startTime"])
    .index("by_live", ["isLive"]),

  // Live Stream Viewers
  liveStreamViewers: defineTable({
    streamId: v.id("liveStreamClasses"),
    userId: v.id("users"),
    clerkId: v.string(),
    joinedAt: v.number(),
    leftAt: v.optional(v.number()),
    duration: v.optional(v.number()), // seconds watched
  })
    .index("by_stream", ["streamId"])
    .index("by_user", ["userId"])
    .index("by_clerk", ["clerkId"]),

  // Gift Cards
  giftCards: defineTable({
    code: v.string(), // Unique gift card code
    amount: v.number(), // AUD
    balance: v.number(), // Remaining balance
    purchasedBy: v.id("users"),
    purchasedByClerkId: v.string(),
    recipientEmail: v.optional(v.string()),
    recipientName: v.optional(v.string()),
    message: v.optional(v.string()),
    redeemedBy: v.optional(v.id("users")),
    redeemedByClerkId: v.optional(v.string()),
    redeemedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    stripePaymentIntentId: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("redeemed"), v.literal("expired")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_purchaser", ["purchasedBy"])
    .index("by_recipient_email", ["recipientEmail"])
    .index("by_status", ["status"]),

  // Corporate Memberships
  corporateMemberships: defineTable({
    companyName: v.string(),
    contactEmail: v.string(),
    contactName: v.string(),
    contactPhone: v.string(),
    totalMembers: v.number(),
    discountPercent: v.number(),
    billingCycle: v.union(v.literal("monthly"), v.literal("quarterly"), v.literal("annually")),
    status: v.union(v.literal("active"), v.literal("pending"), v.literal("cancelled")),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_company", ["companyName"]),

  // Webhook Subscriptions
  webhookSubscriptions: defineTable({
    url: v.string(),
    events: v.array(v.string()), // ["member.check_in", "booking.created", etc.]
    secret: v.string(), // Webhook secret for verification
    isActive: v.boolean(),
    lastTriggeredAt: v.optional(v.number()),
    failureCount: v.number(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_url", ["url"]),

  // Webhook Subscription Events Log (for tracking webhook delivery)
  webhookSubscriptionEvents: defineTable({
    subscriptionId: v.id("webhookSubscriptions"),
    eventType: v.string(),
    payload: v.string(), // JSON string
    status: v.union(v.literal("pending"), v.literal("success"), v.literal("failed")),
    responseCode: v.optional(v.number()),
    responseBody: v.optional(v.string()),
    retryCount: v.number(),
    triggeredAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_subscription", ["subscriptionId"])
    .index("by_status", ["status"])
    .index("by_event_type", ["eventType"]),
});