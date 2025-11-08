# 🎯 Clerk Billing Integration Guide

## 📋 Overview

Clerk Billing provides a simplified subscription management solution that integrates with Stripe. Instead of managing Stripe checkout sessions manually, Clerk handles:
- ✅ Plan selection UI (`<PricingTable />` component)
- ✅ Payment processing (via Stripe)
- ✅ User entitlements/features
- ✅ Subscription management UI (`<UserProfile />` component)
- ✅ Invoice history

**Benefits:**
- Simpler setup (no custom checkout flows)
- Built-in UI components
- Automatic entitlement management
- Less code to maintain

---

## 🔧 Clerk Billing Setup

### Step 1: Enable Billing in Clerk Dashboard

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com
   - Select your app: `derrimut` (production)

2. **Enable Billing**
   - Navigate to: **Billing Settings**
   - Click **Enable Billing**
   - Connect your Stripe account (if not already connected)

### Step 2: Create Subscription Plans

In Clerk Dashboard > Billing:

1. **Create Plans** matching Derrimut membership types:
   - **Core (12 Month Minimum)** - $14.95/fortnight
   - **Premium (12 Month Minimum)** - $17.95/fortnight  
   - **Core (Direct Debit)** - $X/fortnight (no lock-in)
   - **Premium (Direct Debit)** - $X/fortnight (no lock-in)

2. **Define Features** (entitlements):
   - `gym_access` - Access to all gyms
   - `group_fitness` - Group fitness classes
   - `personal_trainer` - Personal trainer access
   - `supplement_store` - Supplement superstore access
   - `nutrition_bar` - Nutrition bar access
   - `reformer_pilates` - Reformer Pilates classes
   - `sauna` - Sauna access
   - `basketball_court` - Basketball court access

3. **Assign Features to Plans:**
   - Core plans: `gym_access`, `supplement_store`
   - Premium plans: All features

### Step 3: Install Clerk Billing Components

```bash
# Clerk billing components are included in @clerk/nextjs
# No additional installation needed!
```

### Step 4: Update Code to Use Clerk Billing

#### Replace Membership Page

**Current:** Custom Stripe checkout flow
**New:** Clerk `<PricingTable />` component

```tsx
// src/app/membership/page.tsx
import { PricingTable } from "@clerk/nextjs";

export default function MembershipPage() {
  return (
    <div>
      <h1>Choose Your Membership</h1>
      <PricingTable />
    </div>
  );
}
```

#### Check User Entitlements

```tsx
import { useUser } from "@clerk/nextjs";

function PremiumFeature() {
  const { user } = useUser();
  
  // Check if user has access to group fitness
  if (user?.publicMetadata?.features?.includes("group_fitness")) {
    return <GroupFitnessClasses />;
  }
  
  return <UpgradePrompt />;
}
```

#### Server-Side Entitlement Check

```tsx
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  // Get user from Clerk API
  const user = await clerkClient.users.getUser(userId);
  const features = user.publicMetadata?.features || [];
  
  if (features.includes("group_fitness")) {
    // User has access
  }
}
```

---

## 🔄 Migration Strategy

### Option A: Full Migration (Recommended)

**Replace Stripe checkout with Clerk Billing:**
1. Remove custom checkout session creation
2. Use Clerk `<PricingTable />` component
3. Use Clerk entitlements instead of custom membership checks
4. Keep Stripe for marketplace orders and trainer bookings

**Pros:**
- Simpler codebase
- Built-in UI
- Automatic entitlement management

**Cons:**
- Requires refactoring membership flow
- Need to migrate existing subscriptions

### Option B: Hybrid Approach

**Keep Stripe for memberships, add Clerk for entitlements:**
1. Keep existing Stripe checkout flow
2. Sync Stripe subscriptions to Clerk entitlements via webhook
3. Use Clerk entitlements for feature gating

**Pros:**
- Minimal code changes
- Keep existing Stripe setup
- Get Clerk entitlement benefits

**Cons:**
- More complex (two systems)
- Need webhook sync logic

---

## 📚 Clerk Billing API Reference

### Programmatic Control

Clerk provides SDKs for programmatic control:

**JavaScript/TypeScript:**
```typescript
import { clerkClient } from "@clerk/nextjs/server";

// Get user subscription
const user = await clerkClient.users.getUser(userId);
const subscription = user.publicMetadata?.subscription;

// Update user entitlements
await clerkClient.users.updateUser(userId, {
  publicMetadata: {
    features: ["gym_access", "group_fitness"],
    subscription: "premium",
  },
});
```

**Python SDK:**
```python
from clerk_sdk_python import Clerk

clerk = Clerk(api_key="your_api_key")

# List plans
plans = clerk.billing.list_plans()

# Get user subscription
user = clerk.users.get(user_id)
subscription = user.public_metadata.get("subscription")
```

**C# SDK:**
```csharp
using Clerk.SDK;

var clerk = new ClerkClient("your_api_key");

// Manage subscriptions programmatically
var plans = await clerk.Billing.ListPlansAsync();
```

### Webhooks

Clerk sends webhooks for subscription events:
- `user.subscription.created`
- `user.subscription.updated`
- `user.subscription.cancelled`

**Webhook Handler:**
```typescript
// convex/http.ts or API route
if (event.type === "user.subscription.created") {
  const { userId, planId } = event.data;
  // Sync to Convex database
  await ctx.runMutation(api.memberships.createFromClerk, {
    clerkId: userId,
    planId,
  });
}
```

---

## 🎯 Implementation Plan

### Phase 1: Setup Clerk Billing
- [ ] Enable billing in Clerk Dashboard
- [ ] Create Derrimut membership plans
- [ ] Define features/entitlements
- [ ] Assign features to plans

### Phase 2: Update Frontend
- [ ] Replace membership page with `<PricingTable />`
- [ ] Update feature checks to use Clerk entitlements
- [ ] Add subscription management to user profile

### Phase 3: Backend Integration
- [ ] Set up Clerk webhook handler
- [ ] Sync subscriptions to Convex database
- [ ] Update membership queries to check Clerk entitlements

### Phase 4: Migration
- [ ] Migrate existing Stripe subscriptions (if any)
- [ ] Update admin dashboard to show Clerk subscriptions
- [ ] Test full subscription flow

---

## 🔍 Comparison: Stripe vs Clerk Billing

| Feature | Stripe Direct | Clerk Billing |
|---------|---------------|---------------|
| **Setup Complexity** | High (custom checkout) | Low (built-in components) |
| **UI Components** | Custom build | Built-in `<PricingTable />` |
| **Entitlement Management** | Manual | Automatic |
| **Subscription Management** | Custom UI | Built-in `<UserProfile />` |
| **Payment Processing** | Stripe | Stripe (via Clerk) |
| **Programmatic Control** | Full Stripe API | Clerk SDK + Stripe |
| **Webhook Handling** | Custom | Clerk webhooks |
| **CLI Tools** | Stripe CLI | No dedicated CLI |

---

## 💡 Recommendation

**For Derrimut Platform:**

✅ **Use Clerk Billing for Memberships:**
- Simpler setup
- Built-in UI components
- Automatic entitlement management
- Less code to maintain

✅ **Keep Stripe Direct for:**
- Marketplace orders (one-time payments)
- Trainer booking payments (one-time payments)
- These don't need subscription management

---

## 📝 Next Steps

1. **Enable Clerk Billing** in dashboard
2. **Create plans** matching Derrimut membership types
3. **Define features** for entitlements
4. **Update membership page** to use `<PricingTable />`
5. **Update feature checks** to use Clerk entitlements
6. **Set up webhook** to sync to Convex

---

## 🔗 Resources

- **Clerk Billing Docs:** https://clerk.com/docs/billing/overview
- **PricingTable Component:** https://clerk.com/docs/components/overview/pricing-table
- **UserProfile Component:** https://clerk.com/docs/components/overview/user-profile
- **Clerk SDKs:** https://clerk.com/docs/reference

---

**Status:** Ready to implement! 🚀

