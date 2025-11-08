# 🏢 Organizations & Personal Accounts Setup Guide

## 📋 Overview

This platform supports two types of accounts:

1. **Personal Accounts (Members)** - Individual gym members with personal memberships
2. **Organization Accounts (Admins)** - Derrimut locations/franchises managed by location admins

## 🎯 Architecture

### Account Types

#### Personal Account (`accountType: "personal"`)
- **Purpose:** Individual gym members
- **Default:** All new users start as personal accounts
- **Membership:** Can have personal membership subscriptions
- **Access:** Standard member features (bookings, marketplace, etc.)

#### Organization Account (`accountType: "organization"`)
- **Purpose:** Location/franchise administrators
- **Creation:** Created when user creates a Clerk Organization
- **Membership:** Organization can have multiple members
- **Access:** Admin dashboard for managing location, members, staff

### Organization Structure

```
Organization (Location/Franchise)
├── Admin (org_admin)
│   └── Primary administrator for the location
├── Members (org_member)
│   └── Staff members assigned to this location
└── Personal Members
    └── Gym members who can access this location
```

## 🔧 Setup Steps

### Step 1: Enable Clerk Organizations

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com
   - Select your app (dev or prod)

2. **Enable Organizations**
   - Navigate to: **Organizations** → **Settings**
   - Click **Enable Organizations**
   - Configure settings:
     - **Allow organization creation:** ✅ Enabled
     - **Max allowed memberships:** 1 (users can only admin one location)
     - **Roles:** `org:admin`, `org:member`

3. **Configure Webhooks**
   - Go to: **Webhooks**
   - Ensure these events are enabled:
     - `organization.created`
     - `organization.updated`
     - `organizationMembership.created`
     - `organizationMembership.deleted`
   - Webhook URL: `https://YOUR_CONVEX_DEPLOYMENT.convex.site/clerk-webhook`

### Step 2: Update Environment Variables

Ensure `CLERK_WEBHOOK_SECRET` is set in Convex:

```bash
# Dev
bunx convex env set CLERK_WEBHOOK_SECRET "whsec_..." 

# Prod
bunx convex env set CLERK_WEBHOOK_SECRET "whsec_..." --prod
```

### Step 3: Deploy Schema Changes

The schema has been updated with:
- `organizations` table
- User fields: `accountType`, `organizationId`, `organizationRole`

Deploy to Convex:

```bash
# Dev
bunx convex dev

# Prod
bunx convex deploy --prod
```

## 📊 Database Schema

### Organizations Table

```typescript
{
  clerkOrganizationId: string,      // Clerk organization ID
  name: string,                      // "Derrimut 24:7 Gym - Derrimut"
  slug: string,                     // "derrimut-derrimut"
  type: "location" | "franchise",
  status: "active" | "inactive" | "pending",
  address: {
    street: string,
    city: string,
    state: string,                  // "VIC", "SA", etc.
    postcode: string,
    country: string,                 // "Australia"
  },
  coordinates?: { lat: number, lng: number },
  phone?: string,
  email?: string,
  is24Hours: boolean,
  features: string[],               // ["group_fitness", "personal_trainer", ...]
  adminId: Id<"users">,
  adminClerkId: string,
  totalMembers: number,
  totalStaff: number,
  createdAt: number,
  updatedAt: number,
}
```

### Users Table Updates

```typescript
{
  // ... existing fields ...
  accountType?: "personal" | "organization",
  organizationId?: Id<"organizations">,
  organizationRole?: "org_admin" | "org_member",
}
```

## 🔌 API Functions

### Organization Management (`convex/organizations.ts`)

#### Queries
- `getOrganizationByClerkId` - Get organization by Clerk ID
- `getOrganizationBySlug` - Get organization by slug
- `getAllOrganizations` - Get all active organizations
- `getOrganizationsByState` - Get organizations by state
- `getOrganizationMembers` - Get members of an organization
- `getUserOrganization` - Get user's organization
- `isOrganizationAdmin` - Check if user is org admin

#### Mutations
- `createOrUpdateOrganization` - Create/update organization
- `addMemberToOrganization` - Add member to organization
- `removeMemberFromOrganization` - Remove member
- `updateOrganization` - Update organization details

## 🎨 Frontend Integration

### Using Clerk Organization Hooks

```typescript
import { useOrganization, useOrganizationList } from "@clerk/nextjs";

function MyComponent() {
  const { organization } = useOrganization();
  const { organizationList } = useOrganizationList();
  
  // Check if user is in an organization
  if (organization) {
    // User is part of an organization
    console.log("Organization:", organization.name);
  }
  
  // List all organizations user belongs to
  organizationList?.forEach(org => {
    console.log("Member of:", org.name);
  });
}
```

### Creating an Organization

```typescript
import { useOrganizationList } from "@clerk/nextjs";

function CreateLocation() {
  const { createOrganization } = useOrganizationList();
  
  const handleCreate = async () => {
    const org = await createOrganization({
      name: "Derrimut 24:7 Gym - Derrimut",
      slug: "derrimut-derrimut",
    });
    
    // Organization will be synced to Convex via webhook
  };
}
```

### Using Prebuilt Components

```typescript
import { CreateOrganization, OrganizationSwitcher } from "@clerk/nextjs";

// Create organization page
<CreateOrganization />

// Organization switcher (if user belongs to multiple)
<OrganizationSwitcher />
```

## 🔄 Webhook Events

The Clerk webhook handler (`convex/http.ts`) processes:

1. **`organization.created`**
   - Creates organization record in Convex
   - Links admin user to organization
   - Sets user `accountType` to `"organization"`

2. **`organization.updated`**
   - Updates organization name/details

3. **`organizationMembership.created`**
   - Adds user to organization
   - Updates user `organizationId` and `organizationRole`

4. **`organizationMembership.deleted`**
   - Removes user from organization
   - Resets user to `accountType: "personal"`

## 📝 Usage Examples

### Create a New Location

```typescript
// 1. User creates organization in Clerk (via UI or API)
const org = await createOrganization({
  name: "Derrimut 24:7 Gym - Airport West",
  slug: "derrimut-airport-west",
});

// 2. Webhook creates organization in Convex
// 3. Admin updates organization details via admin interface
await ctx.runMutation(api.organizations.updateOrganization, {
  organizationId: orgId,
  address: {
    street: "8 Louis Street",
    city: "Airport West",
    state: "VIC",
    postcode: "3042",
    country: "Australia",
  },
  phone: "+61 3 XXXX XXXX",
  is24Hours: true,
  features: ["group_fitness", "personal_trainer", "supplement_store"],
});
```

### Add Staff Member to Location

```typescript
// Add staff member to organization
await ctx.runMutation(api.organizations.addMemberToOrganization, {
  organizationId: locationId,
  userClerkId: staffMemberClerkId,
  role: "org_member",
});
```

### Check User Account Type

```typescript
const user = await ctx.runQuery(api.users.getUserByClerkId, { clerkId });

if (user?.accountType === "organization") {
  // User is a location admin
  const org = await ctx.runQuery(api.organizations.getUserOrganization, { clerkId });
  console.log("Managing location:", org.name);
} else {
  // User is a personal member
  console.log("Personal account");
}
```

## 🎯 Next Steps

1. **Create Admin Interface**
   - Organization creation form
   - Location management dashboard
   - Member management interface

2. **Update Membership System**
   - Support organization memberships
   - Link memberships to locations
   - Track location-specific members

3. **Add Location Features**
   - Location selector for members
   - Location-specific bookings
   - Location analytics

## 📚 Related Documentation

- `ENVIRONMENT_SETUP_STATUS.md` - Environment configuration
- `CLERK_DOMAIN_FIX.md` - Clerk domain setup
- `MEMBERSHIP_PAYMENT_TESTING.md` - Membership testing guide

## ⚠️ Important Notes

1. **Organization Creation:** Organizations are created in Clerk first, then synced to Convex via webhook
2. **Admin Assignment:** The user who creates the organization becomes the admin
3. **Member Limits:** Users can only be admin of one organization (`maxAllowedMemberships: 1`)
4. **Default Account Type:** New users default to `accountType: "personal"`
5. **Webhook Required:** Ensure `CLERK_WEBHOOK_SECRET` is set for organization sync to work

