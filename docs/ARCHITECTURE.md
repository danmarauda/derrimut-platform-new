# System Architecture - Derrimut Platform

**Version:** 1.0.0
**Last Updated:** January 9, 2025
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture Diagram](#system-architecture-diagram)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Authentication & Authorization](#authentication--authorization)
6. [Payment Processing](#payment-processing)
7. [AI Integration](#ai-integration)
8. [Database Schema](#database-schema)
9. [API Architecture](#api-architecture)
10. [Deployment Architecture](#deployment-architecture)
11. [Security Architecture](#security-architecture)
12. [Scalability & Performance](#scalability--performance)

---

## Overview

The Derrimut Platform is a modern, full-stack fitness management application built with cutting-edge technologies for the Australian fitness market. The platform supports multiple gym locations across Victoria with centralized management and real-time capabilities.

### Core Principles

- **Real-time First**: Convex enables instant data synchronization
- **Type Safety**: End-to-end TypeScript for reliability
- **Serverless Architecture**: Auto-scaling, zero server management
- **Security by Design**: Authentication, authorization, and encryption at every layer
- **Australian Market**: Localized for AUD currency, Australian addresses, and timezone

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 15 + React 19 | Server-side rendering, routing |
| UI Components | shadcn/ui + Tailwind CSS | Accessible, customizable components |
| Backend | Convex | Real-time database and serverless functions |
| Authentication | Clerk | User management and SSO |
| Payments | Stripe | Subscription and one-time payments |
| Voice AI | Vapi | Voice-based fitness plan generation |
| AI | Google Gemini 2.5 | Workout and diet plan generation |
| Hosting | Vercel | Edge network deployment |

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                          │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐│
│  │  Member Portal   │  │  Trainer Portal  │  │  Admin Dashboard     ││
│  │                  │  │                  │  │                      ││
│  │  - Profile       │  │  - Schedule      │  │  - User Management   ││
│  │  - Membership    │  │  - Sessions      │  │  - Organizations     ││
│  │  - Bookings      │  │  - Earnings      │  │  - Salary Management ││
│  │  - Orders        │  │  - Availability  │  │  - Reports           ││
│  │  - AI Plans      │  │                  │  │  - Settings          ││
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘│
│         │                      │                        │             │
└─────────┼──────────────────────┼────────────────────────┼─────────────┘
          │                      │                        │
          └──────────────────────┴────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Next.js Middleware    │
                    │  (Clerk Auth Guard)     │
                    └────────────┬────────────┘
                                 │
┌────────────────────────────────▼─────────────────────────────────────────┐
│                        APPLICATION LAYER                                 │
│                      (Next.js 15 App Router)                             │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Server Components                           │   │
│  │  - Page rendering (RSC)                                         │   │
│  │  - Data fetching (Convex queries)                               │   │
│  │  - SEO optimization                                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Client Components                           │   │
│  │  - Interactive UI (forms, modals)                               │   │
│  │  - Real-time updates (Convex subscriptions)                     │   │
│  │  - Payment flows (Stripe Elements)                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      API Routes                                  │   │
│  │  - /api/create-checkout-session                                 │   │
│  │  - /api/create-marketplace-checkout                             │   │
│  │  - /api/create-session-checkout                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────┬───────────────────────────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        │                             │
              ┌─────────▼────────┐         ┌─────────▼────────┐
              │  Clerk Auth      │         │  Stripe API      │
              │  - User sessions │         │  - Checkout      │
              │  - JWT tokens    │         │  - Webhooks      │
              └─────────┬────────┘         └─────────┬────────┘
                        │                             │
┌───────────────────────▼─────────────────────────────▼───────────────────┐
│                        BACKEND LAYER                                    │
│                     (Convex Real-time Backend)                          │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                      HTTP Routes                                  │ │
│  │  - POST /clerk-webhook (user sync)                               │ │
│  │  - POST /stripe-webhook (payment events)                         │ │
│  │  - POST /vapi/generate-program (AI plan generation)              │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                      Queries (Read)                               │ │
│  │  - getUserByClerkId                                              │ │
│  │  - getMembershipByClerkId                                        │ │
│  │  - getUserBookings                                               │ │
│  │  - getOrganizations                                              │ │
│  │  - getUserOrders                                                 │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                      Mutations (Write)                            │ │
│  │  - syncUser                                                      │ │
│  │  - upsertMembership                                              │ │
│  │  - createPaidBooking                                             │ │
│  │  - createOrderFromCart                                           │ │
│  │  - createPlan                                                    │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                      Convex Database                              │ │
│  │  26 Tables:                                                      │ │
│  │  - users, memberships, organizations, bookings                   │ │
│  │  - orders, products, cart, trainerProfiles                       │ │
│  │  - fitnessPlans, dietPlans, payroll, etc.                        │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
          ┌─────────▼────────┐              ┌──────────▼─────────┐
          │  Google Gemini   │              │   Vapi Voice AI    │
          │  - Workout Gen   │              │   - Voice calls    │
          │  - Diet Gen      │              │   - Workflows      │
          └──────────────────┘              └────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                                │
│                                                                         │
│  Clerk Auth  │  Stripe Payments  │  Google Gemini  │  Vapi Voice AI   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

#### Page Components (Server Components)
Located in: `src/app/`

```typescript
// Server Component Pattern
export default async function ProfilePage() {
  // Direct Convex query on server
  const user = await fetchQuery(api.users.getUserByClerkId, { clerkId });

  // Render with user data
  return <ProfileLayout user={user} />;
}
```

**Benefits:**
- Zero JavaScript to browser for static content
- Faster initial page load
- Better SEO

#### UI Components (Client Components)
Located in: `src/components/`

```typescript
// Client Component Pattern
'use client';

export function BookingForm() {
  // Real-time Convex subscription
  const bookings = useQuery(api.bookings.getUserBookings, { userClerkId });

  // Interactive state
  const [selectedDate, setSelectedDate] = useState<Date>();

  return <FormUI bookings={bookings} />;
}
```

**Benefits:**
- Real-time data updates
- Interactive UI elements
- Client-side state management

### Admin Dashboard Architecture

```
┌─────────────────────────────────────────┐
│         Admin Dashboard                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   AdminLayout                   │   │
│  │   - Sidebar navigation          │   │
│  │   - Role guard (admin only)     │   │
│  │   - Organization selector       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Admin Pages                   │   │
│  │   - Users (/admin/users)        │   │
│  │   - Organizations (/admin/orgs) │   │
│  │   - Salary (/admin/salary)      │   │
│  │   - Reports (/admin/reports)    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Trainer Portal Architecture

```
┌─────────────────────────────────────────┐
│         Trainer Portal                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   TrainerLayout                 │   │
│  │   - Schedule calendar           │   │
│  │   - Availability manager        │   │
│  │   - Earnings tracker            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Trainer Pages                 │   │
│  │   - Dashboard (/trainer)        │   │
│  │   - Sessions (/trainer/sessions)│   │
│  │   - Clients (/trainer/clients)  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Data Flow

### Membership Purchase Flow

```
1. User clicks "Join Now"
   ↓
2. Next.js renders membership page
   - Fetch membership tiers from Convex
   - Display pricing (AUD)
   ↓
3. User selects tier → Clicks "Subscribe"
   ↓
4. Next.js API route: /api/create-checkout-session
   - Create Stripe checkout session
   - Pass metadata: { clerkId, membershipType }
   - Return checkout URL
   ↓
5. User redirected to Stripe Checkout
   - Enter payment details
   - Complete purchase
   ↓
6. Stripe sends webhook → Convex: /stripe-webhook
   - Event: customer.subscription.created
   - Extract metadata (clerkId, membershipType)
   ↓
7. Convex mutation: upsertMembership
   - Create/update membership record
   - Link to user via clerkId
   ↓
8. User redirected to success page
   - Real-time subscription synced to UI
   - Membership badge updated
```

### Trainer Booking Flow

```
1. User visits /trainer-booking
   ↓
2. Browse available trainers
   - Convex query: getAllTrainers
   - Display trainer profiles
   ↓
3. Select trainer → Choose date/time
   - Check trainer availability
   - Select session type (Personal Training, etc.)
   ↓
4. Click "Book Session"
   ↓
5. Next.js API route: /api/create-session-checkout
   - Create Stripe checkout session (one-time payment)
   - Pass metadata: { userId, trainerId, sessionDate, startTime, duration }
   - Return checkout URL
   ↓
6. User completes payment on Stripe
   ↓
7. Stripe webhook → Convex: /stripe-webhook
   - Event: checkout.session.completed
   - Extract booking metadata
   ↓
8. Convex mutation: createPaidBooking
   - Create booking record
   - Set status: "confirmed"
   - Set paymentStatus: "paid"
   ↓
9. User sees booking in profile
   - Trainer sees booking in schedule
   - Email notification sent (future)
```

### AI Plan Generation Flow

```
1. User visits /generate-program
   ↓
2. Click "Start Voice Consultation"
   ↓
3. Vapi initializes voice call
   - Pass variables: { user_id, full_name }
   - Start voice AI conversation
   ↓
4. User answers questions via voice
   - Age, height, weight
   - Injuries, workout days
   - Fitness goal, level
   - Dietary restrictions
   ↓
5. Vapi workflow calls Convex HTTP: /vapi/generate-program
   - POST request with user responses
   ↓
6. Convex HTTP action:
   a. Call Google Gemini for workout plan
   b. Call Google Gemini for diet plan
   c. Validate AI responses
   d. Save to database via createPlan mutation
   ↓
7. Return success response to Vapi
   ↓
8. Voice call ends
   ↓
9. User auto-redirected to /profile
   - Plans visible immediately (real-time sync)
```

---

## Authentication & Authorization

### Authentication Flow (Clerk)

```
┌─────────────────────────────────────────────┐
│              User attempts login            │
└──────────────────┬──────────────────────────┘
                   ↓
┌──────────────────────────────────────────────┐
│      Clerk Sign-In Component                 │
│      - Email/Password                        │
│      - Google OAuth                          │
│      - Magic Link                            │
└──────────────────┬───────────────────────────┘
                   ↓
         ┌─────────────────┐
         │  Clerk API      │
         │  - Verify       │
         │  - Issue JWT    │
         └────────┬────────┘
                  ↓
         ┌────────────────────┐
         │  Next.js Middleware │
         │  - Verify JWT       │
         │  - Set session      │
         └────────┬───────────┘
                  ↓
        ┌─────────────────────┐
        │  Protected Route     │
        │  - User authenticated│
        │  - Render page       │
        └──────────────────────┘
```

### Authorization Levels

```typescript
// Role Hierarchy
type Role = 'superadmin' | 'admin' | 'trainer' | 'user';

// Role Permissions
const permissions = {
  superadmin: [
    'manage:all_organizations',
    'manage:all_users',
    'view:all_reports',
    'manage:system_settings'
  ],
  admin: [
    'manage:organization',
    'manage:organization_users',
    'view:organization_reports',
    'manage:trainers'
  ],
  trainer: [
    'view:own_schedule',
    'manage:own_availability',
    'view:own_earnings',
    'view:clients'
  ],
  user: [
    'view:own_profile',
    'manage:own_bookings',
    'view:own_orders',
    'view:own_plans'
  ]
};
```

### Protected Routes

```typescript
// middleware.ts
export default clerkMiddleware((auth, request) => {
  // Public routes
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return;
  }

  // Protected routes - require authentication
  auth().protect();

  // Role-specific routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    requireRole(auth, ['admin', 'superadmin']);
  }

  if (request.nextUrl.pathname.startsWith('/trainer')) {
    requireRole(auth, ['trainer', 'admin', 'superadmin']);
  }
});
```

---

## Payment Processing

### Stripe Integration Architecture

```
┌────────────────────────────────────────────────┐
│           Payment Types                        │
├────────────────────────────────────────────────┤
│  1. Membership Subscriptions (recurring)       │
│  2. Trainer Bookings (one-time)                │
│  3. Marketplace Products (one-time)            │
└────────────────────────────────────────────────┘
                     │
    ┌────────────────┴────────────────┐
    │                                 │
    ▼                                 ▼
┌─────────────────┐        ┌──────────────────┐
│ Subscription    │        │  One-Time        │
│ Checkout        │        │  Payment         │
│                 │        │  Checkout        │
│ Mode: "subscription" │   │ Mode: "payment"  │
└────────┬────────┘        └─────────┬────────┘
         │                           │
         └───────────┬───────────────┘
                     ↓
         ┌───────────────────────┐
         │  Stripe Checkout      │
         │  - Hosted payment page│
         │  - PCI compliant      │
         │  - Multiple methods   │
         └───────────┬───────────┘
                     ↓
         ┌───────────────────────┐
         │  Stripe Webhooks      │
         │  - Signature verified │
         │  - Event processed    │
         └───────────┬───────────┘
                     ↓
         ┌───────────────────────┐
         │  Convex Mutation      │
         │  - Update database    │
         │  - Sync status        │
         └───────────────────────┘
```

### Webhook Event Handling

```typescript
// Supported Stripe Events
const stripeEvents = {
  // Subscriptions
  'customer.subscription.created': handleSubscriptionCreated,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionDeleted,

  // One-time payments
  'checkout.session.completed': handleCheckoutCompleted,

  // Invoices
  'invoice.payment_succeeded': handleInvoiceSucceeded,
  'invoice.payment_failed': handleInvoiceFailed
};

// Event Router
async function processWebhook(event) {
  const handler = stripeEvents[event.type];
  if (handler) {
    await handler(event.data.object);
  }
}
```

---

## AI Integration

### Vapi Voice AI Architecture

```
┌─────────────────────────────────────────┐
│        User Device (Browser)            │
│  - Microphone access                    │
│  - Audio playback                       │
└──────────────┬──────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────┐
│         Vapi Voice Agent                 │
│  - Speech-to-Text (STT)                  │
│  - Natural Language Understanding        │
│  - Text-to-Speech (TTS)                  │
│  - Conversation flow management          │
└──────────────┬───────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────┐
│         Vapi Workflow                    │
│  ID: e13b1b19-3cd5-42ab-ba5d-7c46bf989a6e│
│  - Collect user data via questions       │
│  - Pass to backend via webhook           │
└──────────────┬───────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────┐
│    Convex HTTP: /vapi/generate-program   │
│  1. Receive user responses               │
│  2. Call Google Gemini for workout       │
│  3. Call Google Gemini for diet          │
│  4. Validate AI outputs                  │
│  5. Save to database                     │
└──────────────┬───────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────┐
│         Database (fitnessPlans)          │
│  - Linked to user                        │
│  - Available in real-time                │
└──────────────────────────────────────────┘
```

### Google Gemini Integration

```typescript
// AI Plan Generation Pipeline
async function generateFitnessPlans(userData) {
  // 1. Initialize Gemini
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.4, // More predictable
      responseMimeType: "application/json"
    }
  });

  // 2. Generate workout plan
  const workoutPrompt = buildWorkoutPrompt(userData);
  const workoutResponse = await model.generateContent(workoutPrompt);
  let workoutPlan = JSON.parse(workoutResponse.text());
  workoutPlan = validateWorkoutPlan(workoutPlan); // Type safety

  // 3. Generate diet plan
  const dietPrompt = buildDietPrompt(userData);
  const dietResponse = await model.generateContent(dietPrompt);
  let dietPlan = JSON.parse(dietResponse.text());
  dietPlan = validateDietPlan(dietPlan); // Type safety

  // 4. Save to database
  return { workoutPlan, dietPlan };
}
```

---

## Database Schema

### Core Tables (26 total)

#### Users & Authentication
```typescript
users {
  _id: Id<"users">
  name: string
  email: string
  image?: string
  clerkId: string // Unique
  role?: "superadmin" | "admin" | "trainer" | "user"
  accountType?: "personal" | "organization"
  organizationId?: Id<"organizations">
  createdAt: number
  updatedAt: number
}
```

#### Memberships
```typescript
memberships {
  _id: Id<"memberships">
  userId: Id<"users">
  clerkId: string
  membershipType: "18-month-minimum" | "12-month-minimum" | "no-lock-in" | "12-month-upfront"
  status: "active" | "cancelled" | "expired" | "pending"
  stripeCustomerId: string
  stripeSubscriptionId: string
  stripePriceId: string
  currentPeriodStart: number
  currentPeriodEnd: number
  cancelAtPeriodEnd: boolean
  createdAt: number
  updatedAt: number
}
```

#### Organizations
```typescript
organizations {
  _id: Id<"organizations">
  clerkOrganizationId: string
  name: string
  slug: string
  type: "location" | "franchise"
  status: "active" | "inactive" | "pending"
  address: {
    street: string
    city: string
    state: string
    postcode: string
    country: string
  }
  is24Hours: boolean
  features: string[]
  adminId: Id<"users">
  totalMembers: number
  totalStaff: number
  createdAt: number
  updatedAt: number
}
```

#### Bookings
```typescript
bookings {
  _id: Id<"bookings">
  userId: Id<"users">
  trainerId: Id<"trainerProfiles">
  sessionType: "personal_training" | "zumba" | "yoga" | "crossfit" | "cardio" | "strength"
  sessionDate: string // "2025-01-15"
  startTime: string // "14:00"
  endTime: string // "15:00"
  duration: number // minutes
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show"
  totalAmount: number
  paymentStatus: "pending" | "paid" | "refunded" | "included_with_membership"
  paymentSessionId?: string
  notes?: string
  createdAt: number
  updatedAt: number
}
```

#### Orders & Products
```typescript
orders {
  _id: Id<"orders">
  userId: Id<"users">
  clerkId: string
  orderNumber: string // "ORD-20250109-001"
  items: Array<{
    productId: Id<"products">
    productName: string
    quantity: number
    price: number
    total: number
  }>
  totalAmount: number
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "pending" | "paid" | "refunded"
  shippingAddress: {
    name: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  stripeSessionId: string
  stripePaymentIntentId?: string
  trackingNumber?: string
  createdAt: number
  updatedAt: number
}

products {
  _id: Id<"products">
  name: string
  description: string
  price: number
  compareAtPrice?: number
  category: "supplement" | "equipment" | "apparel" | "accessory"
  images: string[]
  stock: number
  isActive: boolean
  createdAt: number
}
```

#### Fitness Plans
```typescript
fitnessPlans {
  _id: Id<"fitnessPlans">
  userId: string // clerkId
  name: string
  workoutPlan: {
    schedule: string[] // ["Monday", "Wednesday", "Friday"]
    exercises: Array<{
      day: string
      routines: Array<{
        name: string
        sets: number
        reps: number
      }>
    }>
  }
  dietPlan: {
    dailyCalories: number
    meals: Array<{
      name: string
      foods: string[]
    }>
  }
  isActive: boolean
  createdAt: number
  updatedAt?: number
}
```

### Data Relationships

```
users (1) ←──→ (1) memberships
users (1) ←──→ (many) bookings
users (1) ←──→ (many) orders
users (1) ←──→ (many) fitnessPlans
users (many) ←──→ (1) organizations
trainerProfiles (1) ←──→ (many) bookings
products (many) ←──→ (many) orders (via order items)
```

---

## API Architecture

### Convex Queries (Read Operations)

```typescript
// Pattern: Reactive queries with automatic caching
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  }
});

// Benefit: Automatic re-execution when data changes
// Frontend automatically updates when database changes
```

### Convex Mutations (Write Operations)

```typescript
// Pattern: Transactional mutations
export const upsertMembership = mutation({
  args: {
    userId: v.id("users"),
    membershipType: v.string(),
    // ... more args
  },
  handler: async (ctx, args) => {
    // Find existing membership
    const existing = await ctx.db
      .query("memberships")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      // Update
      await ctx.db.patch(existing._id, { ...args });
    } else {
      // Create
      await ctx.db.insert("memberships", { ...args });
    }
  }
});

// Benefit: Atomic operations, automatic transaction management
```

### Next.js API Routes

```typescript
// Pattern: External integration endpoints
// /api/create-checkout-session/route.ts
export async function POST(req: Request) {
  // 1. Get user session from Clerk
  const { userId } = auth();

  // 2. Create Stripe checkout
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    metadata: { clerkId: userId, membershipType },
    // ... config
  });

  // 3. Return checkout URL
  return Response.json({ url: session.url });
}

// Benefit: Integration with external services (Stripe, etc.)
```

---

## Deployment Architecture

### Vercel Edge Network

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                      │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Sydney  │  │Melbourne │  │ Brisbane │  │  Perth   │  │
│  │  (syd1)  │  │          │  │          │  │          │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │             │             │         │
│       └─────────────┴─────────────┴─────────────┘         │
│                          │                                 │
└──────────────────────────┼─────────────────────────────────┘
                           │
                           ↓
                  ┌─────────────────┐
                  │  Edge Functions │
                  │  - SSR          │
                  │  - API Routes   │
                  └────────┬────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ↓                         ↓
    ┌──────────────────┐      ┌─────────────────┐
    │  Convex Backend  │      │  Static Assets  │
    │  - Database      │      │  - Images       │
    │  - Functions     │      │  - CSS/JS       │
    └──────────────────┘      └─────────────────┘
```

### Environment Configuration

```bash
# Development
CONVEX_DEPLOYMENT=dev:enchanted-salamander-914
NEXT_PUBLIC_CONVEX_URL=https://enchanted-salamander-914.convex.cloud

# Production
CONVEX_DEPLOYMENT=prod:spotted-gerbil-236
NEXT_PUBLIC_CONVEX_URL=https://spotted-gerbil-236.convex.cloud
```

### Deployment Pipeline

```
┌──────────────┐
│  Developer   │
│  git push    │
└──────┬───────┘
       │
       ↓
┌──────────────────┐
│  GitHub Actions  │
│  - Lint          │
│  - Typecheck     │
│  - Test          │
│  - Build         │
└──────┬───────────┘
       │
       ↓ (on success)
┌──────────────────┐
│  Vercel Deploy   │
│  - Build         │
│  - Deploy to edge│
│  - Health check  │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│  Production      │
│  - Live traffic  │
│  - Monitoring    │
└──────────────────┘
```

---

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────┐
│  Layer 1: Edge Protection (Vercel WAF)      │
│  - DDoS mitigation                          │
│  - IP filtering                             │
│  - Rate limiting (global)                   │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  Layer 2: Authentication (Clerk)            │
│  - JWT verification                         │
│  - Session management                       │
│  - MFA support (optional)                   │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  Layer 3: Authorization (Role Guards)       │
│  - Role-based access control                │
│  - Organization-scoped permissions          │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  Layer 4: Data Protection (Convex)          │
│  - Encrypted at rest                        │
│  - Encrypted in transit (TLS 1.3)           │
│  - Automatic backups                        │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  Layer 5: Payment Security (Stripe)         │
│  - PCI DSS compliant                        │
│  - Tokenized payments                       │
│  - Webhook signature verification           │
└─────────────────────────────────────────────┘
```

### Environment Variable Security

```typescript
// ✅ CORRECT: Validation on startup
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

// ✅ CORRECT: Public variables prefixed
NEXT_PUBLIC_CONVEX_URL=...

// ❌ WRONG: Never expose secrets
// STRIPE_SECRET_KEY should NOT have NEXT_PUBLIC_ prefix
```

---

## Scalability & Performance

### Auto-Scaling

```
Current Load:
┌─────────────────────────────────────┐
│  Concurrent Users: 100              │
│  Request Rate: 50 req/s             │
│  Edge Functions: 2 instances        │
│  Convex Functions: Auto-scale       │
└─────────────────────────────────────┘

High Load (expected):
┌─────────────────────────────────────┐
│  Concurrent Users: 10,000           │
│  Request Rate: 5,000 req/s          │
│  Edge Functions: Auto-scale to 100+│
│  Convex Functions: Auto-scale       │
└─────────────────────────────────────┘
```

### Performance Optimizations

1. **React Server Components**: Zero JS for static content
2. **Convex Caching**: Automatic query result caching
3. **Edge Functions**: Low-latency responses (< 50ms Australia-wide)
4. **Image Optimization**: Next.js Image component (WebP, lazy loading)
5. **Code Splitting**: Automatic route-based splitting
6. **Database Indexing**: Indexed queries on clerkId, email, etc.

### Performance Metrics (Target)

| Metric | Target | Actual (Dev) |
|--------|--------|--------------|
| Time to First Byte (TTFB) | < 200ms | ~150ms |
| First Contentful Paint (FCP) | < 1.5s | ~1.2s |
| Largest Contentful Paint (LCP) | < 2.5s | ~2.0s |
| Time to Interactive (TTI) | < 3.5s | ~3.0s |
| API Response Time | < 300ms | ~200ms |

---

## Monitoring & Observability

### Monitoring Stack (Planned)

```
┌─────────────────────────────────────────┐
│  Application Monitoring (Sentry)        │
│  - Error tracking                       │
│  - Performance monitoring               │
│  - User session replay                  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  Infrastructure (Vercel Analytics)      │
│  - Traffic patterns                     │
│  - Function execution times             │
│  - Bandwidth usage                      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  Database (Convex Dashboard)            │
│  - Query performance                    │
│  - Function execution logs              │
│  - Table sizes                          │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  Payments (Stripe Dashboard)            │
│  - Payment success rate                 │
│  - Webhook delivery                     │
│  - Subscription metrics                 │
└─────────────────────────────────────────┘
```

---

## Future Architecture Enhancements

### Phase 2 (Q2 2025)
- [ ] Multi-region Convex deployment
- [ ] Redis caching layer for frequently accessed data
- [ ] WebSocket connections for real-time chat (trainer-member)
- [ ] Mobile app (React Native) sharing backend

### Phase 3 (Q3 2025)
- [ ] Microservices for specialized features (video streaming)
- [ ] GraphQL API layer for flexible queries
- [ ] Message queue (for async tasks like email sending)
- [ ] Advanced analytics with Mixpanel/Amplitude

---

## Glossary

- **RSC**: React Server Components
- **Edge Functions**: Serverless functions running at CDN edge
- **Convex**: Real-time backend-as-a-service
- **Clerk**: Authentication and user management service
- **TTFB**: Time to First Byte
- **LCP**: Largest Contentful Paint
- **PCI DSS**: Payment Card Industry Data Security Standard

---

**Document Version:** 1.0.0
**Last Updated:** January 9, 2025
**Next Review:** March 9, 2025
