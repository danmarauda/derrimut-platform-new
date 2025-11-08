# 👑 Admin Dashboards Guide

## 📋 Overview

The Derrimut 24:7 Gym platform now supports two types of admin dashboards:

1. **Superadmin Dashboard** - For Derrimut Owner (Adrian Portelli)
2. **Location Admin Dashboard** - For Franchise/Location Administrators

## 🎯 Role Hierarchy

```
superadmin (Derrimut Owner)
  ├── Full platform access
  ├── All locations overview
  └── Can promote users to admin/superadmin

admin (Location Admin)
  ├── Location-specific access
  ├── Manage location members/staff
  └── Location settings and features
```

## 🔐 Accessing Dashboards

### Superadmin Dashboard
- **Route:** `/super-admin/dashboard`
- **Access:** Users with `role: "superadmin"`
- **Features:**
  - Platform-wide statistics
  - All 18 locations overview
  - Total members, revenue, orders
  - Location distribution by state
  - Quick actions to manage platform

### Location Admin Dashboard
- **Route:** `/location-admin/dashboard`
- **Access:** Users with `role: "admin"` AND assigned to an organization
- **Features:**
  - Location-specific statistics
  - Members and staff for their location
  - Location features and details
  - Quick actions for location management

### Smart Routing
- **Route:** `/admin`
- **Behavior:** Automatically redirects based on role
  - Superadmin → `/super-admin/dashboard`
  - Location Admin → `/location-admin/dashboard`

## 🛠️ Setting Up Roles

### 1. Create Superadmin (Adrian Portelli)

**Option A: Via Super Admin Page**
1. Navigate to `/super-admin`
2. Enter super admin key: `DERRIMUT_SUPER_ADMIN_2025`
3. Click "Become Admin"
4. User will be assigned `role: "superadmin"`

**Option B: Via Convex CLI**
```bash
bunx convex run users:createSuperAdmin --args '{
  "clerkId": "USER_CLERK_ID",
  "email": "adrian@derrimut247.com.au",
  "name": "Adrian Portelli",
  "superAdminKey": "DERRIMUT_SUPER_ADMIN_2025"
}'
```

### 2. Assign Location Admins

**Via Superadmin Dashboard:**
1. Go to `/admin/users`
2. Find the user
3. Update their role to `admin`
4. Assign them to an organization via `/admin/organizations`

**Via Convex CLI:**
```bash
# Update user role
bunx convex run users:updateUserRole --args '{
  "userId": "USER_ID",
  "role": "admin"
}'

# Add user to organization
bunx convex run organizations:addMemberToOrganization --args '{
  "organizationId": "ORG_ID",
  "userClerkId": "USER_CLERK_ID",
  "role": "org_admin"
}'
```

## 📊 Dashboard Features

### Superadmin Dashboard Features

**Statistics Cards:**
- Total Locations (18)
- Total Members (across all locations)
- Active Memberships
- Monthly Revenue
- Total Users (members, trainers, admins)
- Active Trainers
- Total Orders
- Marketplace Stats

**Location Overview:**
- Locations grouped by state (VIC, SA, QLD)
- Quick access to location management
- System status and alerts

**Quick Actions:**
- Manage Locations
- Manage Users
- Manage Memberships
- Manage Trainers

### Location Admin Dashboard Features

**Location Header:**
- Location name and address
- Contact information (phone, email)
- 24/7 access indicator
- Status badge

**Statistics Cards:**
- Total Members (at this location)
- Staff Members (including trainers)
- Active Memberships
- Location Status

**Location Details:**
- Features list (group fitness, sauna, etc.)
- Staff members list
- Quick actions for location management

## 🔄 Navigation

### AdminLayout Sidebar

**For Superadmins:**
- Super Admin (Crown icon) - Links to superadmin dashboard
- Dashboard
- Members
- Locations
- Trainers
- Salary
- Inventory
- Memberships
- Recipes
- Blog
- Marketplace

**For Location Admins:**
- Dashboard
- Members
- Locations
- Trainers
- Salary
- Inventory
- Memberships
- Recipes
- Blog
- Marketplace

## 🎨 UI Components

Both dashboards use:
- **Card components** for statistics
- **Badge components** for status indicators
- **Button components** for actions
- **Responsive design** (mobile-friendly)
- **Derrimut branding** (red/black color scheme)

## 🔒 Security

- **RoleGuard** protects all admin routes
- Only users with appropriate roles can access dashboards
- Superadmin can promote users to admin/superadmin
- Regular admins can only manage their location

## 📝 Notes

1. **Superadmin Key:** Can be set via environment variable `SUPER_ADMIN_KEY` (defaults to `DERRIMUT_SUPER_ADMIN_2025`)

2. **Location Assignment:** Location admins must be assigned to an organization via:
   - Clerk Organization (automatically synced via webhook)
   - Manual assignment via admin panel

3. **Dashboard Access:** Users are automatically redirected to the appropriate dashboard based on their role

4. **Future Enhancements:**
   - Location-specific membership filtering
   - Location revenue tracking
   - Staff management interface
   - Location analytics and reports

