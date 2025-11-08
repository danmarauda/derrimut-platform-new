# 🚀 Clerk Billing Quick Start

## ✅ What Clerk Billing Provides

1. **Built-in UI Components:**
   - `<PricingTable />` - Display plans and handle subscriptions
   - `<UserProfile />` - User subscription management (includes Billing tab)

2. **Automatic Entitlement Management:**
   - Features stored in `user.publicMetadata.features`
   - `has()` helper function for feature checks
   - Automatic sync with Stripe subscriptions

3. **Simplified Setup:**
   - No custom checkout session creation
   - No webhook handling for subscriptions (Clerk handles it)
   - Less code to maintain

---

## 📝 Quick Implementation

### 1. Enable Billing in Clerk Dashboard

1. Go to: https://dashboard.clerk.com
2. Select app: `derrimut`
3. Navigate to: **Billing** → **Settings**
4. Click **Enable Billing**
5. Connect Stripe account (or use shared test account for dev)

### 2. Create Plans in Clerk Dashboard

**Plans to Create:**
- **Core (12 Month)** - $14.95/fortnight
- **Premium (12 Month)** - $17.95/fortnight
- **Core (Direct Debit)** - $X/fortnight
- **Premium (Direct Debit)** - $X/fortnight

**Features to Define:**
- `gym_access` - Access all gyms
- `group_fitness` - Group fitness classes
- `personal_trainer` - Personal trainer access
- `supplement_store` - Supplement superstore
- `nutrition_bar` - Nutrition bar access
- `reformer_pilates` - Reformer Pilates
- `sauna` - Sauna access
- `basketball_court` - Basketball court

### 3. Update Membership Page

```tsx
// src/app/membership/page.tsx
"use client";

import { PricingTable } from "@clerk/nextjs";
import { DERRIMUT_BRAND } from "@/constants/branding";

export default function MembershipPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Choose Your {DERRIMUT_BRAND.nameShort} Membership
        </h1>
        <p className="text-xl text-muted-foreground">
          Access all {DERRIMUT_BRAND.nameShort} locations Australia-wide
        </p>
      </div>
      
      {/* Clerk handles the entire subscription flow */}
      <PricingTable />
    </div>
  );
}
```

### 4. Check User Entitlements

```tsx
// Example: Feature gating
import { useUser } from "@clerk/nextjs";

function GroupFitnessSection() {
  const { user } = useUser();
  
  // Check if user has group_fitness feature
  const hasGroupFitness = user?.publicMetadata?.features?.includes("group_fitness");
  
  if (!hasGroupFitness) {
    return (
      <div>
        <p>Upgrade to Premium to access group fitness classes</p>
        <Link href="/membership">View Plans</Link>
      </div>
    );
  }
  
  return <GroupFitnessClasses />;
}
```

### 5. Server-Side Entitlement Check

```tsx
// API route or server component
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  const user = await clerkClient.users.getUser(userId);
  const features = user.publicMetadata?.features || [];
  
  if (features.includes("group_fitness")) {
    // User has access
    return Response.json({ access: true });
  }
  
  return Response.json({ access: false });
}
```

---

## 🔄 Migration from Stripe Direct

### What Changes:

**Before (Stripe Direct):**
- Custom checkout session creation
- Webhook handling for subscriptions
- Manual membership status tracking
- Custom UI for plan selection

**After (Clerk Billing):**
- Clerk `<PricingTable />` component
- Automatic webhook handling
- Entitlements in `user.publicMetadata`
- Built-in subscription management UI

### What Stays the Same:

- Stripe still processes payments
- Marketplace orders (keep Stripe direct)
- Trainer bookings (keep Stripe direct)
- Convex database (still sync for reporting)

---

## 🎯 Benefits for Derrimut Platform

1. **Simpler Code:**
   - Remove custom checkout session creation
   - Remove subscription webhook handling
   - Use Clerk's built-in components

2. **Better UX:**
   - Professional pricing table UI
   - Built-in subscription management
   - Invoice history in user profile

3. **Easier Maintenance:**
   - Less code to maintain
   - Automatic entitlement sync
   - Clerk handles subscription lifecycle

---

## 📋 Implementation Checklist

- [ ] Enable billing in Clerk Dashboard
- [ ] Create Derrimut membership plans
- [ ] Define features/entitlements
- [ ] Replace membership page with `<PricingTable />`
- [ ] Update feature checks to use Clerk entitlements
- [ ] Test subscription flow
- [ ] Update admin dashboard (if needed)
- [ ] Migrate existing subscriptions (if any)

---

**Ready to implement!** 🚀

