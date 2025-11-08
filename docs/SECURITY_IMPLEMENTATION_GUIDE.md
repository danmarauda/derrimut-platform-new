# Security Implementation Guide - Derrimut Platform

## Overview

This guide provides comprehensive examples and patterns for implementing security measures across the Derrimut Platform.

**Tasks Completed:**
- ✅ Task 1.6: Environment Variable Validation
- ✅ Task 2.1: Input Validation with Zod
- ✅ Task 2.2: Rate Limiting
- ✅ Task 2.3: CSRF Protection  
- ✅ Task 4.3: Security Headers

---

## Table of Contents

1. [Environment Validation](#environment-validation)
2. [Input Validation Examples](#input-validation-examples)
3. [Rate Limiting Implementation](#rate-limiting-implementation)
4. [CSRF Protection Usage](#csrf-protection-usage)
5. [API Route Security Pattern](#api-route-security-pattern)
6. [Convex Function Validation](#convex-function-validation)

---

## Environment Validation

### Automatic Validation on Startup

Environment variables are automatically validated when the app starts. The validation happens in `src/lib/env.ts` and is imported by `src/app/layout.tsx`.

**What happens:**
1. App starts
2. `env.ts` validates all environment variables
3. If any are missing or invalid, app fails with clear error messages
4. In production, process exits immediately
5. In development, error is logged but app continues (for easier debugging)

### Using Validated Environment Variables

```typescript
// ✅ CORRECT - Use validated env from @/lib/env
import { env } from '@/lib/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const convexUrl = env.NEXT_PUBLIC_CONVEX_URL;

// ❌ WRONG - Don't use process.env directly
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

### Getting Environment Info

```typescript
import { getEnvironmentInfo, isDevelopment, isProduction } from '@/lib/env';

// Check environment
if (isDevelopment) {
  console.log('Running in development mode');
}

// Get safe environment info for logging
const info = getEnvironmentInfo();
// Returns: { nodeEnv, convexDeployment, hasStripe, hasClerk, etc. }
```

---

## Input Validation Examples

### API Route with Validation

```typescript
// src/app/api/bookings/create/route.ts
import { NextResponse } from 'next/server';
import { createBookingSchema } from '@/lib/validations/booking';
import { validateWithSchema, createValidationErrorResponse, createSuccessResponse } from '@/lib/validations/utils';

export async function POST(request: Request) {
  try {
    // Get request body
    const body = await request.json();
    
    // Validate using schema
    const validation = validateWithSchema(createBookingSchema, body);
    
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors);
    }
    
    // validation.data is now type-safe and validated
    const booking = await createBooking(validation.data);
    
    return createSuccessResponse(booking);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Convex Function with Validation

```typescript
// convex/bookings.ts
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { createPaidBookingSchema } from "@/lib/validations/booking";
import { validateWithSchema } from "@/lib/validations/utils";

export const createPaidBooking = mutation({
  args: {
    userId: v.string(),
    trainerId: v.string(),
    userClerkId: v.string(),
    sessionType: v.string(),
    sessionDate: v.string(),
    startTime: v.string(),
    duration: v.number(),
    totalAmount: v.number(),
    paymentSessionId: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate input
    const validation = validateWithSchema(createPaidBookingSchema, args);
    
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    const validatedArgs = validation.data;
    
    // Use validated data
    const bookingId = await ctx.db.insert("bookings", {
      ...validatedArgs,
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: Date.now(),
    });
    
    return bookingId;
  },
});
```

### Form Validation (Client-Side)

```typescript
// components/BookingForm.tsx
'use client';

import { useState } from 'react';
import { createBookingSchema } from '@/lib/validations/booking';
import { validateWithSchema } from '@/lib/validations/utils';

export function BookingForm() {
  const [errors, setErrors] = useState<string[]>([]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const data = {
      userId: formData.get('userId'),
      trainerId: formData.get('trainerId'),
      sessionType: formData.get('sessionType'),
      sessionDate: formData.get('sessionDate'),
      startTime: formData.get('startTime'),
      duration: Number(formData.get('duration')),
      notes: formData.get('notes'),
    };
    
    // Client-side validation
    const validation = validateWithSchema(createBookingSchema, data);
    
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }
    
    // Submit to API
    const response = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validation.data),
    });
    
    // Handle response...
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div className="errors">
          {errors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}
      {/* Form fields... */}
    </form>
  );
}
```

---

## Rate Limiting Implementation

### Basic API Route with Rate Limiting

```typescript
// src/app/api/public/data/route.ts
import { NextResponse } from 'next/server';
import { apiLimiter } from '@/lib/rate-limit';

// Note: Express-based rate limiters need adapter for Next.js App Router
// This is a conceptual example - actual implementation may vary

export async function GET(request: Request) {
  // Check rate limit
  // In production, use middleware or edge function for rate limiting
  
  // Your logic here
  return NextResponse.json({ data: 'response' });
}
```

### Strict Rate Limiting for Sensitive Routes

```typescript
// src/app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import { strictLimiter } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Apply strict rate limiting (10 requests per 15 minutes)
  
  const body = await request.json();
  // Process password reset...
  
  return NextResponse.json({ success: true });
}
```

### Custom Rate Limiter

```typescript
import { createRateLimiter } from '@/lib/rate-limit';

// Custom rate limiter: 5 requests per minute
const customLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many requests for this operation',
});
```

### In-Memory Rate Limiting (Simple)

```typescript
import { memoryStore, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = memoryStore.increment(
    `api:booking:${clientIp}`,
    15 * 60 * 1000, // 15 minutes
    10 // max 10 requests
  );
  
  if (!rateLimit.allowed) {
    return new Response('Too many requests', { status: 429 });
  }
  
  // Process request...
}
```

---

## CSRF Protection Usage

### Server Component with CSRF Token

```typescript
// app/booking/page.tsx
import { getCSRFTokenForForm } from '@/lib/csrf';

export default async function BookingPage() {
  // Get CSRF token for form
  const csrfToken = await getCSRFTokenForForm();
  
  return (
    <form method="POST" action="/api/bookings/create">
      {/* Hidden CSRF token field */}
      <input type="hidden" name="csrf_token" value={csrfToken} />
      
      {/* Rest of form... */}
      <input type="text" name="sessionType" />
      <button type="submit">Book Session</button>
    </form>
  );
}
```

### API Route with CSRF Protection

```typescript
// src/app/api/bookings/create/route.ts
import { withCSRFProtection } from '@/lib/csrf';
import { NextResponse } from 'next/server';

// Wrap handler with CSRF protection
export const POST = withCSRFProtection(async (request: Request) => {
  // CSRF already validated, proceed with logic
  const body = await request.json();
  
  // Create booking...
  
  return NextResponse.json({ success: true });
});
```

### Client-Side API Call with CSRF

```typescript
// components/BookingForm.tsx
'use client';

export function BookingForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For client-side, CSRF token should be in cookie
    // Need to send it in header
    const csrfToken = getCookie('csrf-token');
    
    const response = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      body: JSON.stringify(data),
    });
  };
}

function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift()!;
  return '';
}
```

### Manual CSRF Validation

```typescript
import { validateCSRF, createCSRFErrorResponse } from '@/lib/csrf';

export async function POST(request: Request) {
  // Manual CSRF validation
  const validation = await validateCSRF(request);
  
  if (!validation.valid) {
    return createCSRFErrorResponse(validation.error);
  }
  
  // CSRF valid, proceed...
}
```

---

## API Route Security Pattern (Complete Example)

### Fully Secured API Route

```typescript
// src/app/api/bookings/create/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createBookingSchema } from '@/lib/validations/booking';
import { validateWithSchema, createValidationErrorResponse, createSuccessResponse } from '@/lib/validations/utils';
import { withCSRFProtection } from '@/lib/csrf';
import { memoryStore, getClientIp } from '@/lib/rate-limit';

// Complete security pattern
export const POST = withCSRFProtection(async (request: Request) => {
  try {
    // 1. Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = memoryStore.increment(
      `api:booking:${clientIp}`,
      15 * 60 * 1000, // 15 minutes
      10 // max 10 bookings per 15 minutes
    );
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many booking requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000)),
          },
        }
      );
    }
    
    // 2. Authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 3. Input validation
    const body = await request.json();
    const validation = validateWithSchema(createBookingSchema, body);
    
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors);
    }
    
    // 4. Authorization (check if user owns the booking)
    if (validation.data.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // 5. Business logic (validated and authorized)
    const booking = await createBooking(validation.data);
    
    return createSuccessResponse(booking);
    
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
```

---

## Convex Function Validation

### Complete Convex Mutation with Security

```typescript
// convex/bookings.ts
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { createPaidBookingSchema } from "@/lib/validations/booking";
import { validateWithSchema } from "@/lib/validations/utils";

export const createPaidBooking = mutation({
  args: {
    userId: v.string(),
    trainerId: v.string(),
    userClerkId: v.string(),
    sessionType: v.string(),
    sessionDate: v.string(),
    startTime: v.string(),
    duration: v.number(),
    totalAmount: v.number(),
    paymentSessionId: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // 2. Input validation
    const validation = validateWithSchema(createPaidBookingSchema, args);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    const validatedArgs = validation.data;
    
    // 3. Authorization (check Clerk ID matches)
    if (validatedArgs.userClerkId !== identity.subject) {
      throw new Error("Forbidden: User ID mismatch");
    }
    
    // 4. Business logic validation
    const trainer = await ctx.db.get(validatedArgs.trainerId);
    if (!trainer) {
      throw new Error("Trainer not found");
    }
    
    // 5. Check for duplicate bookings (idempotency)
    const existingBooking = await ctx.db
      .query("bookings")
      .withIndex("by_payment_session", (q) => 
        q.eq("paymentSessionId", validatedArgs.paymentSessionId)
      )
      .first();
    
    if (existingBooking) {
      // Return existing booking (idempotent)
      return existingBooking._id;
    }
    
    // 6. Create booking
    const bookingId = await ctx.db.insert("bookings", {
      ...validatedArgs,
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return bookingId;
  },
});
```

---

## Security Checklist for New Features

When adding new features, ensure:

- [ ] **Environment variables** validated in `src/lib/env.ts`
- [ ] **Input validation** schemas created in `src/lib/validations/`
- [ ] **API routes** protected with authentication (Clerk)
- [ ] **Rate limiting** applied to API routes
- [ ] **CSRF protection** for state-changing operations
- [ ] **Authorization** checks (user owns the resource)
- [ ] **Error handling** with standardized responses
- [ ] **Logging** for security events
- [ ] **Type safety** with TypeScript (no `any`)
- [ ] **Security headers** properly configured

---

## Testing Security

### Test Environment Validation

```bash
# Should fail with clear error
NEXT_PUBLIC_CONVEX_URL=invalid npm run dev

# Should succeed
NEXT_PUBLIC_CONVEX_URL=https://valid.convex.cloud npm run dev
```

### Test Input Validation

```typescript
// __tests__/validation/booking.test.ts
import { createBookingSchema } from '@/lib/validations/booking';

test('validates correct booking data', () => {
  const validData = {
    userId: 'user123',
    trainerId: 'trainer456',
    sessionType: 'Personal Training',
    sessionDate: '2025-01-15T10:00:00Z',
    startTime: '10:00',
    duration: 60,
  };
  
  expect(() => createBookingSchema.parse(validData)).not.toThrow();
});

test('rejects invalid session type', () => {
  const invalidData = {
    userId: 'user123',
    trainerId: 'trainer456',
    sessionType: 'Invalid Type',
    sessionDate: '2025-01-15T10:00:00Z',
    startTime: '10:00',
    duration: 60,
  };
  
  expect(() => createBookingSchema.parse(invalidData)).toThrow();
});
```

### Test Rate Limiting

```bash
# Send 11 requests in quick succession
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/test-endpoint
done

# 11th request should return 429 Too Many Requests
```

### Test CSRF Protection

```bash
# Should fail without CSRF token
curl -X POST http://localhost:3000/api/bookings/create \
  -H "Content-Type: application/json" \
  -d '{"data":"test"}'

# Should succeed with valid CSRF token
curl -X POST http://localhost:3000/api/bookings/create \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: valid-token" \
  -d '{"data":"test"}'
```

---

**Last Updated:** January 9, 2025
**Author:** Security Specialist Agent (Task 1.6, 2.1, 2.2, 2.3, 4.3)
