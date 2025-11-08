# API Documentation - Derrimut Platform

**Version:** 0.1.0
**Last Updated:** January 9, 2025
**Base URL (Dev):** `http://localhost:3000`
**Base URL (Prod):** `https://derrimut-platform.vercel.app`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Convex Endpoints](#convex-endpoints)
4. [HTTP Endpoints](#http-endpoints)
5. [Webhooks](#webhooks)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Overview

The Derrimut Platform API is built on **Convex** (real-time backend) and **Next.js** App Router. The API provides endpoints for:

- User management and authentication
- Membership subscriptions
- Trainer booking system
- Marketplace/e-commerce
- AI fitness plan generation
- Organization management
- Salary/payroll system

### Technology Stack

- **Convex**: Real-time database and backend functions
- **Next.js 16**: API routes for external integrations
- **Clerk**: Authentication and user management
- **Stripe**: Payment processing
- **Vapi**: Voice AI integration
- **Google Gemini AI**: Fitness plan generation

---

## Authentication

All API requests require authentication via Clerk.

### Authentication Methods

1. **Web Application**: Session-based auth via Clerk middleware
2. **API Requests**: Bearer token in Authorization header

```bash
Authorization: Bearer <clerk_session_token>
```

### Roles

- `superadmin`: Global administrator (manages all locations)
- `admin`: Organization administrator (manages single location)
- `trainer`: Fitness trainer
- `user`: Regular member

---

## Convex Endpoints

Convex provides type-safe queries and mutations. Access via Convex client.

### User Management

#### `api.users.getUserByClerkId`
Get user by Clerk ID.

```typescript
// Query
const user = await ctx.runQuery(api.users.getUserByClerkId, {
  clerkId: "user_abc123"
});

// Response
{
  _id: Id<"users">,
  name: "John Doe",
  email: "john@example.com",
  clerkId: "user_abc123",
  role: "user",
  accountType: "personal",
  organizationId?: Id<"organizations">,
  createdAt: 1704843600000
}
```

#### `api.users.syncUser`
Create or update user from Clerk webhook.

```typescript
// Mutation
await ctx.runMutation(api.users.syncUser, {
  email: "john@example.com",
  name: "John Doe",
  image: "https://img.clerk.com/...",
  clerkId: "user_abc123"
});
```

#### `api.users.updateUserRole`
Update user role (admin only).

```typescript
// Mutation
await ctx.runMutation(api.users.updateUserRole, {
  userId: Id<"users">,
  role: "admin"
});
```

### Membership Management

#### `api.memberships.getMembershipByClerkId`
Get user's active membership.

```typescript
// Query
const membership = await ctx.runQuery(api.memberships.getMembershipByClerkId, {
  clerkId: "user_abc123"
});

// Response
{
  _id: Id<"memberships">,
  userId: Id<"users">,
  clerkId: "user_abc123",
  membershipType: "18-month-minimum",
  status: "active",
  stripeCustomerId: "cus_abc123",
  stripeSubscriptionId: "sub_abc123",
  stripePriceId: "price_abc123",
  currentPeriodStart: 1704843600000,
  currentPeriodEnd: 1707522000000,
  cancelAtPeriodEnd: false
}
```

#### `api.memberships.upsertMembership`
Create or update membership (called by Stripe webhook).

```typescript
// Mutation
await ctx.runMutation(api.memberships.upsertMembership, {
  userId: Id<"users">,
  clerkId: "user_abc123",
  membershipType: "18-month-minimum",
  stripeCustomerId: "cus_abc123",
  stripeSubscriptionId: "sub_abc123",
  stripePriceId: "price_abc123",
  currentPeriodStart: 1704843600000,
  currentPeriodEnd: 1707522000000
});
```

#### `api.memberships.updateMembershipStatus`
Update subscription status (renewals, cancellations).

```typescript
// Mutation
await ctx.runMutation(api.memberships.updateMembershipStatus, {
  stripeSubscriptionId: "sub_abc123",
  status: "active",
  currentPeriodStart: 1704843600000,
  currentPeriodEnd: 1707522000000,
  cancelAtPeriodEnd: false
});
```

### Trainer Booking

#### `api.bookings.getUserBookings`
Get all bookings for a user.

```typescript
// Query
const bookings = await ctx.runQuery(api.bookings.getUserBookings, {
  userClerkId: "user_abc123"
});

// Response
[{
  _id: Id<"bookings">,
  userId: Id<"users">,
  trainerId: Id<"trainerProfiles">,
  sessionType: "personal_training",
  sessionDate: "2025-01-15",
  startTime: "14:00",
  endTime: "15:00",
  duration: 60,
  status: "confirmed",
  totalAmount: 80,
  paymentStatus: "paid",
  paymentSessionId: "cs_test_abc123"
}]
```

#### `api.bookings.createPaidBooking`
Create a booking with payment confirmation.

```typescript
// Mutation
await ctx.runMutation(api.bookings.createPaidBooking, {
  userId: Id<"users">,
  trainerId: Id<"trainerProfiles">,
  userClerkId: "user_abc123",
  sessionType: "personal_training",
  sessionDate: "2025-01-15",
  startTime: "14:00",
  duration: 60,
  totalAmount: 80,
  paymentSessionId: "cs_test_abc123",
  notes: "First session"
});
```

### Marketplace/Orders

#### `api.orders.createOrderFromCart`
Create order from user's cart.

```typescript
// Mutation
const result = await ctx.runMutation(api.orders.createOrderFromCart, {
  clerkId: "user_abc123",
  shippingAddress: {
    name: "John Doe",
    phone: "0412345678",
    addressLine1: "123 Main St",
    city: "Melbourne",
    postalCode: "3000",
    country: "Australia"
  },
  stripeSessionId: "cs_test_abc123"
});

// Response
{
  orderId: Id<"orders">,
  orderNumber: "ORD-20250109-001"
}
```

#### `api.orders.getUserOrders`
Get all orders for a user.

```typescript
// Query
const orders = await ctx.runQuery(api.orders.getUserOrders, {
  userClerkId: "user_abc123"
});

// Response
[{
  _id: Id<"orders">,
  orderNumber: "ORD-20250109-001",
  items: [...],
  totalAmount: 125.50,
  status: "confirmed",
  paymentStatus: "paid",
  shippingAddress: {...},
  createdAt: 1704843600000
}]
```

### Organizations

#### `api.organizations.getOrganizations`
Get all organizations (superadmin only).

```typescript
// Query
const orgs = await ctx.runQuery(api.organizations.getOrganizations, {});

// Response
[{
  _id: Id<"organizations">,
  name: "Derrimut 24:7 Gym - Derrimut",
  slug: "derrimut-derrimut",
  type: "location",
  status: "active",
  address: {
    street: "123 Derrimut Rd",
    city: "Derrimut",
    state: "VIC",
    postcode: "3030",
    country: "Australia"
  },
  is24Hours: true,
  features: ["group_fitness", "personal_trainer", "supplement_store"],
  totalMembers: 450,
  totalStaff: 12
}]
```

### Fitness Plans

#### `api.plans.createPlan`
Create AI-generated fitness plan (called by Vapi workflow).

```typescript
// Mutation
await ctx.runMutation(api.plans.createPlan, {
  userId: "user_abc123",
  name: "Weight Loss Plan - Jan 2025",
  workoutPlan: {
    schedule: ["Monday", "Wednesday", "Friday"],
    exercises: [
      {
        day: "Monday",
        routines: [
          { name: "Squats", sets: 3, reps: 12 },
          { name: "Push-ups", sets: 3, reps: 15 }
        ]
      }
    ]
  },
  dietPlan: {
    dailyCalories: 2000,
    meals: [
      {
        name: "Breakfast",
        foods: ["Oatmeal with berries", "Greek yogurt"]
      }
    ]
  },
  isActive: true
});
```

### Salary Management

#### `api.salary.getPayrollRecords`
Get payroll records (admin only).

```typescript
// Query
const payroll = await ctx.runQuery(api.salary.getPayrollRecords, {
  month: "January",
  year: 2025
});

// Response
[{
  employeeId: Id<"users">,
  employeeName: "Jane Trainer",
  employeeRole: "trainer",
  payrollPeriod: {
    month: "January",
    year: 2025,
    periodLabel: "January 2025"
  },
  earnings: {
    baseSalary: 5000,
    sessionEarnings: 800,
    totalEarnings: 5800
  },
  netSalary: 4930,
  status: "approved"
}]
```

---

## HTTP Endpoints

These are Next.js API routes for external integrations.

### Clerk Webhook

**Endpoint:** `POST /api/clerk-webhook`
**Purpose:** Sync user data from Clerk
**Authentication:** Svix webhook signature verification

```bash
curl -X POST https://your-domain.vercel.app/api/clerk-webhook \
  -H "Content-Type: application/json" \
  -H "svix-id: msg_abc123" \
  -H "svix-timestamp: 1704843600" \
  -H "svix-signature: v1,signature_here" \
  -d '{
    "type": "user.created",
    "data": {
      "id": "user_abc123",
      "first_name": "John",
      "last_name": "Doe",
      "email_addresses": [{"email_address": "john@example.com"}],
      "image_url": "https://img.clerk.com/..."
    }
  }'
```

**Response:**
```json
{ "message": "Webhooks processed successfully" }
```

### Stripe Webhook

**Endpoint:** `POST /api/stripe-webhook`
**Purpose:** Handle payment events
**Authentication:** Stripe signature verification

```bash
curl -X POST https://your-domain.vercel.app/api/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=1704843600,v1=signature_here" \
  -d '{
    "type": "customer.subscription.created",
    "data": {
      "object": {
        "id": "sub_abc123",
        "customer": "cus_abc123",
        "status": "active",
        "current_period_start": 1704843600,
        "current_period_end": 1707522000
      }
    }
  }'
```

**Supported Events:**
- `customer.subscription.created` - New membership
- `customer.subscription.updated` - Renewal/change
- `customer.subscription.deleted` - Cancellation
- `checkout.session.completed` - One-time payment
- `invoice.payment_succeeded` - Successful payment
- `invoice.payment_failed` - Failed payment

### Vapi Fitness Plan Generation

**Endpoint:** `POST /vapi/generate-program`
**Purpose:** Generate AI fitness and diet plans
**Authentication:** None (called by Vapi workflow)

```bash
curl -X POST https://your-convex-url.convex.site/vapi/generate-program \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_abc123",
    "age": 30,
    "height": "180cm",
    "weight": "80kg",
    "injuries": "None",
    "workout_days": "3 days per week",
    "fitness_goal": "Weight loss",
    "fitness_level": "Beginner",
    "dietary_restrictions": "No dairy"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "planId": "<plan_id>",
    "workoutPlan": {
      "schedule": ["Monday", "Wednesday", "Friday"],
      "exercises": [...]
    },
    "dietPlan": {
      "dailyCalories": 2000,
      "meals": [...]
    }
  }
}
```

### Create Membership Checkout

**Endpoint:** `POST /api/create-checkout-session`
**Purpose:** Create Stripe checkout for membership
**Authentication:** Clerk session required

```bash
curl -X POST https://your-domain.vercel.app/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk_token>" \
  -d '{
    "priceId": "price_abc123",
    "membershipType": "18-month-minimum"
  }'
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_abc123"
}
```

### Create Booking Checkout

**Endpoint:** `POST /api/create-booking-checkout`
**Purpose:** Create Stripe checkout for trainer booking
**Authentication:** Clerk session required

```bash
curl -X POST https://your-domain.vercel.app/api/create-booking-checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk_token>" \
  -d '{
    "trainerId": "<trainer_id>",
    "sessionType": "personal_training",
    "sessionDate": "2025-01-15",
    "startTime": "14:00",
    "duration": 60,
    "totalAmount": 80
  }'
```

---

## Webhooks

### Configuring Webhooks

#### Clerk Webhook

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/clerk-webhook`
3. Select events:
   - `user.created`
   - `user.updated`
   - `organization.created`
   - `organization.updated`
   - `organizationMembership.created`
   - `organizationMembership.deleted`
4. Copy webhook secret to `CLERK_WEBHOOK_SECRET`

#### Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-convex-url.convex.site/stripe-webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

---

## Data Models

### User
```typescript
{
  _id: Id<"users">,
  name: string,
  email: string,
  image?: string,
  clerkId: string,
  role?: "superadmin" | "admin" | "trainer" | "user",
  accountType?: "personal" | "organization",
  organizationId?: Id<"organizations">,
  createdAt: number,
  updatedAt: number
}
```

### Membership
```typescript
{
  _id: Id<"memberships">,
  userId: Id<"users">,
  clerkId: string,
  membershipType: "18-month-minimum" | "12-month-minimum" | "no-lock-in" | "12-month-upfront",
  status: "active" | "cancelled" | "expired" | "pending",
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  stripePriceId: string,
  currentPeriodStart: number,
  currentPeriodEnd: number,
  cancelAtPeriodEnd: boolean,
  createdAt: number,
  updatedAt: number
}
```

### Booking
```typescript
{
  _id: Id<"bookings">,
  userId: Id<"users">,
  trainerId: Id<"trainerProfiles">,
  sessionType: "personal_training" | "zumba" | "yoga" | "crossfit" | "cardio" | "strength",
  sessionDate: string, // "2025-01-15"
  startTime: string, // "14:00"
  endTime: string, // "15:00"
  duration: number, // minutes
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show",
  totalAmount: number,
  paymentStatus: "pending" | "paid" | "refunded" | "included_with_membership",
  paymentSessionId?: string,
  notes?: string,
  createdAt: number,
  updatedAt: number
}
```

### Organization
```typescript
{
  _id: Id<"organizations">,
  clerkOrganizationId: string,
  name: string,
  slug: string,
  type: "location" | "franchise",
  status: "active" | "inactive" | "pending",
  address: {
    street: string,
    city: string,
    state: string,
    postcode: string,
    country: string
  },
  is24Hours: boolean,
  features: string[],
  adminId: Id<"users">,
  totalMembers: number,
  totalStaff: number,
  createdAt: number,
  updatedAt: number
}
```

---

## Error Handling

### Error Response Format

```typescript
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `STRIPE_ERROR` | Payment processing error | 400 |
| `WEBHOOK_ERROR` | Webhook signature verification failed | 400 |
| `INTERNAL_ERROR` | Server error | 500 |

### Example Error Response

```json
{
  "success": false,
  "error": "User not found with Clerk ID: user_abc123",
  "code": "NOT_FOUND"
}
```

---

## Rate Limiting

**Status:** ⚠️ Not implemented yet

**Planned Limits:**
- Authentication endpoints: 10 requests/minute
- API endpoints: 60 requests/minute
- Webhook endpoints: 100 requests/minute

---

## Testing

### Development Environment

```bash
# Start Convex dev server
npx convex dev

# Start Next.js dev server
npm run dev

# Test Stripe webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Testing Webhooks

```bash
# Test Stripe webhook
stripe trigger customer.subscription.created

# Test with custom data
curl -X POST http://localhost:3000/api/stripe-webhook \
  -H "stripe-signature: test-signature-for-development" \
  -d @test-webhook-payload.json
```

---

## Additional Resources

- [Convex Documentation](https://docs.convex.dev)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Clerk API Reference](https://clerk.com/docs/reference)

---

**Last Updated:** January 9, 2025
**Maintainer:** Development Team
**Support:** support@derrimut247.com.au
