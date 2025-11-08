# Derrimut Platform - Comprehensive Project Inventory

**Generated:** 2025-01-09
**Project:** Derrimut 24:7 Gym Platform
**Tech Stack:** Next.js 16, React 19, Convex, Clerk, Stripe, TypeScript

---

## 📊 Project Statistics

- **Total Pages:** 61 routes
- **Total Components:** 35 components
- **Total UI Components:** 14 base + 4 premium
- **Database Tables:** 26 tables
- **API Endpoints:** 24 modules
- **Context Providers:** 2 providers
- **Library Utilities:** 4 modules

---

## 🗺️ Complete Route Map (61 Pages)

### 🔐 Authentication Routes (2)
Location: `src/app/(auth)/`

1. **Sign In** - `/sign-in`
   - File: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
   - Purpose: Clerk-powered authentication login page
   - Features: Email/password, OAuth providers

2. **Sign Up** - `/sign-up`
   - File: `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
   - Purpose: New user registration
   - Features: Email/password, OAuth providers

---

### 🏠 Public Pages (9)
Location: `src/app/`

3. **Homepage** - `/`
   - File: `src/app/page.tsx`
   - Purpose: Main landing page
   - Features: Hero section, gym locations, membership CTAs, testimonials

4. **About** - `/about`
   - File: `src/app/about/page.tsx`
   - Purpose: About Derrimut 24:7 Gym
   - Features: Company history, mission, team

5. **Contact** - `/contact`
   - File: `src/app/contact/page.tsx`
   - Purpose: Contact form and information
   - Features: Contact form, locations map, email/phone

6. **Help** - `/help`
   - File: `src/app/help/page.tsx`
   - Purpose: Help center and FAQ
   - Features: FAQ accordion, search, support links

7. **Privacy Policy** - `/privacy`
   - File: `src/app/privacy/page.tsx`
   - Purpose: Privacy policy and data protection
   - Features: Legal text, GDPR compliance

8. **Terms of Service** - `/terms`
   - File: `src/app/terms/page.tsx`
   - Purpose: Terms and conditions
   - Features: Legal text, membership terms

9. **Recipes** - `/recipes`
   - File: `src/app/recipes/page.tsx`
   - Purpose: Browse healthy recipes
   - Features: Recipe grid, category filters, search

10. **Recipe Detail** - `/recipes/[id]`
    - File: `src/app/recipes/[id]/page.tsx`
    - Purpose: Individual recipe page
    - Features: Ingredients, instructions, nutrition facts, cooking time

11. **Reviews** - `/reviews`
    - File: `src/app/reviews/page.tsx`
    - Purpose: Member testimonials and reviews
    - Features: Review cards, ratings, filtering

---

### 👤 User Profile Pages (9)
Location: `src/app/profile/`
Access: Requires authentication

12. **Profile Dashboard** - `/profile`
    - File: `src/app/profile/page.tsx`
    - Purpose: User profile overview
    - Features: Membership status, fitness plans, recent bookings, payroll (if staff)

13. **Diet Plans** - `/profile/diet-plans`
    - File: `src/app/profile/diet-plans/page.tsx`
    - Purpose: View and manage diet plans
    - Features: Meal plans, calorie tracking, macros

14. **Fitness Plans** - `/profile/fitness-plans`
    - File: `src/app/profile/fitness-plans/page.tsx`
    - Purpose: View workout programs
    - Features: Exercise schedules, routines, progress tracking

15. **Orders** - `/profile/orders`
    - File: `src/app/profile/orders/page.tsx`
    - Purpose: Marketplace order history
    - Features: Order list, tracking, receipts

16. **Payment Slips** - `/profile/payment-slips`
    - File: `src/app/profile/payment-slips/page.tsx`
    - Purpose: Staff salary payment records
    - Features: Payroll history, download slips

17. **Progress Tracking** - `/profile/progress`
    - File: `src/app/profile/progress/page.tsx`
    - Purpose: Fitness progress tracking
    - Features: Weight tracking, measurements, photos

18. **My Reviews** - `/profile/reviews`
    - File: `src/app/profile/reviews/page.tsx`
    - Purpose: User's submitted reviews
    - Features: Review management, edit/delete

19. **Settings** - `/profile/settings`
    - File: `src/app/profile/settings/page.tsx`
    - Purpose: Account settings
    - Features: Profile editing, password change, notifications

20. **Training Sessions** - `/profile/training-sessions`
    - File: `src/app/profile/training-sessions/page.tsx`
    - Purpose: Booked training sessions
    - Features: Session history, upcoming sessions, cancellation

---

### 🏋️ Membership & Booking (4)

21. **Membership Plans** - `/membership`
    - File: `src/app/membership/page.tsx`
    - Purpose: Browse and purchase memberships
    - Features: Plan comparison, pricing, Stripe checkout

22. **Membership Success** - `/membership/success`
    - File: `src/app/membership/success/page.tsx`
    - Purpose: Post-purchase confirmation
    - Features: Success message, membership details

23. **Generate Program** - `/generate-program`
    - File: `src/app/generate-program/page.tsx`
    - Purpose: AI-generated fitness programs
    - Features: Form inputs, AI generation

24. **Booking Success** - `/booking-success`
    - File: `src/app/booking-success/page.tsx`
    - Purpose: Training session booking confirmation
    - Features: Booking details, calendar add

---

### 👨‍🏫 Trainer Features (6)

25. **Become a Trainer** - `/become-trainer`
    - File: `src/app/become-trainer/page.tsx`
    - Purpose: Trainer application form
    - Features: Application form, certifications upload

26. **Trainer Dashboard** - `/trainer`
    - File: `src/app/trainer/page.tsx`
    - Purpose: Trainer's main dashboard
    - Features: Today's bookings, stats, reviews, payroll, availability management

27. **Trainer Setup** - `/trainer/setup`
    - File: `src/app/trainer/setup/page.tsx`
    - Purpose: New trainer profile setup
    - Features: Bio, specializations, rates, photos

28. **Trainer Profile** - `/trainer-profile/[trainerId]`
    - File: `src/app/trainer-profile/[trainerId]/page.tsx`
    - Purpose: Public trainer profile
    - Features: Bio, specializations, reviews, booking button

29. **Book Trainer Session** - `/book-session/[trainerId]`
    - File: `src/app/book-session/[trainerId]/page.tsx`
    - Purpose: Book a session with specific trainer
    - Features: Calendar, time slots, session type selection

30. **Trainer Booking** - `/trainer-booking`
    - File: `src/app/trainer-booking/page.tsx`
    - Purpose: Browse and book trainers
    - Features: Trainer grid, filtering by specialization

---

### 🛒 Marketplace (5)

31. **Marketplace Home** - `/marketplace`
    - File: `src/app/marketplace/page.tsx`
    - Purpose: Browse supplements and equipment
    - Features: Product grid, category filters, search

32. **Product Detail** - `/marketplace/product/[id]`
    - File: `src/app/marketplace/product/[id]/page.tsx`
    - Purpose: Individual product page
    - Features: Product details, add to cart, reviews

33. **Shopping Cart** - `/marketplace/cart`
    - File: `src/app/marketplace/cart/page.tsx`
    - Purpose: Review cart items
    - Features: Quantity adjustment, remove items, total calculation

34. **Checkout** - `/marketplace/checkout`
    - File: `src/app/marketplace/checkout/page.tsx`
    - Purpose: Complete purchase
    - Features: Stripe payment, shipping details

35. **Checkout Success** - `/marketplace/checkout/success`
    - File: `src/app/marketplace/checkout/success/page.tsx`
    - Purpose: Order confirmation
    - Features: Order summary, tracking info

---

### 📝 Blog (3)

36. **Blog Home** - `/blog`
    - File: `src/app/blog/page.tsx`
    - Purpose: Browse blog posts
    - Features: Post grid, categories, search

37. **Blog Post** - `/blog/[slug]`
    - File: `src/app/blog/[slug]/page.tsx`
    - Purpose: Individual blog post
    - Features: Rich content, comments, likes, related posts

38. **Create Community Post** - `/community/create`
    - File: `src/app/community/create/page.tsx`
    - Purpose: Create new blog/community post
    - Features: Rich text editor, image upload

---

### 🔧 Admin Pages (13)
Location: `src/app/admin/`
Access: Requires admin role

39. **Admin Dashboard** - `/admin`
    - File: `src/app/admin/page.tsx`
    - Purpose: Admin overview dashboard
    - Features: Key metrics, recent activities, quick actions

40. **User Management** - `/admin/users`
    - File: `src/app/admin/users/page.tsx`
    - Purpose: Manage all users
    - Features: User list, role assignment, search, filtering

41. **Memberships** - `/admin/memberships`
    - File: `src/app/admin/memberships/page.tsx`
    - Purpose: Manage member subscriptions
    - Features: Membership list, status updates, cancellations

42. **Organizations** - `/admin/organizations`
    - File: `src/app/admin/organizations/page.tsx`
    - Purpose: Manage gym locations/franchises
    - Features: Location list, create/edit locations, staff assignment

43. **Trainer Applications** - `/admin/trainer-applications`
    - File: `src/app/admin/trainer-applications/page.tsx`
    - Purpose: Review trainer applications
    - Features: Application queue, approve/reject, notes

44. **Trainer Management** - `/admin/trainer-management`
    - File: `src/app/admin/trainer-management/page.tsx`
    - Purpose: Manage active trainers
    - Features: Trainer list, activate/deactivate, edit profiles

45. **Inventory** - `/admin/inventory`
    - File: `src/app/admin/inventory/page.tsx`
    - Purpose: Stock management
    - Features: Item list, stock levels, reorder alerts

46. **Marketplace Admin** - `/admin/marketplace`
    - File: `src/app/admin/marketplace/page.tsx`
    - Purpose: Manage marketplace products
    - Features: Product CRUD, pricing, categories

47. **Recipe Management** - `/admin/recipes`
    - File: `src/app/admin/recipes/page.tsx`
    - Purpose: Manage recipe database
    - Features: Recipe CRUD, categorization, nutrition data

48. **Seed Recipes** - `/admin/seed-recipes`
    - File: `src/app/admin/seed-recipes/page.tsx`
    - Purpose: Bulk import sample recipes
    - Features: One-click seed data

49. **Blog Management** - `/admin/blog`
    - File: `src/app/admin/blog/page.tsx`
    - Purpose: Manage blog posts
    - Features: Post list, publish/unpublish, analytics

50. **Create Blog Post** - `/admin/blog/create`
    - File: `src/app/admin/blog/create/page.tsx`
    - Purpose: Create new blog post
    - Features: Rich text editor, SEO fields, scheduling

51. **Edit Blog Post** - `/admin/blog/edit/[postId]`
    - File: `src/app/admin/blog/edit/[postId]/page.tsx`
    - Purpose: Edit existing blog post
    - Features: Full post editing, version history

---

### 💰 Salary Management (Admin) (5)
Location: `src/app/admin/salary/`
Access: Requires admin role

52. **Salary Dashboard** - `/admin/salary`
    - File: `src/app/admin/salary/page.tsx`
    - Purpose: Salary system overview
    - Features: Total payroll, pending payments, staff stats

53. **Payroll Processing** - `/admin/salary/payroll`
    - File: `src/app/admin/salary/payroll/page.tsx`
    - Purpose: Process monthly payroll
    - Features: Generate payroll, approve payments, bulk export

54. **Salary Structures** - `/admin/salary/structures`
    - File: `src/app/admin/salary/structures/page.tsx`
    - Purpose: Define salary scales and components
    - Features: Base salary, allowances, deductions

55. **Salary Advances** - `/admin/salary/advances`
    - File: `src/app/admin/salary/advances/page.tsx`
    - Purpose: Manage salary advance requests
    - Features: Advance requests, approval workflow, tracking

56. **Salary Reports** - `/admin/salary/reports`
    - File: `src/app/admin/salary/reports/page.tsx`
    - Purpose: Salary analytics and reports
    - Features: Payroll reports, tax summaries, cost analysis

---

### 🏢 Location Admin (1)
Location: `src/app/location-admin/`
Access: Requires organization admin role

57. **Location Dashboard** - `/location-admin/dashboard`
    - File: `src/app/location-admin/dashboard/page.tsx`
    - Purpose: Single location management
    - Features: Location stats, staff, members, local inventory

---

### 👑 Super Admin (2)
Location: `src/app/super-admin/`
Access: Requires superadmin role

58. **Super Admin Dashboard** - `/super-admin`
    - File: `src/app/super-admin/page.tsx`
    - Purpose: Platform-wide administration
    - Features: System health, all locations, global settings

59. **Super Admin Analytics** - `/super-admin/dashboard`
    - File: `src/app/super-admin/dashboard/page.tsx`
    - Purpose: Advanced analytics and reporting
    - Features: Revenue trends, user growth, location performance

---

### 🎨 Design System Demo (1)

60. **New Design System** - `/new-design-system`
    - File: `src/app/new-design-system/page.tsx`
    - Purpose: Premium wellness design system showcase
    - Features: Component library, design tokens, glassmorphism examples

---

### 🧪 Testing/Debug Pages (3)

61. **Test Booking** - `/test-booking`
    - File: `src/app/test-booking/page.tsx`
    - Purpose: Development testing for booking flow
    - Features: Test data, mock bookings

62. **Stripe Debug** - `/stripe-debug`
    - File: `src/app/stripe-debug/page.tsx`
    - Purpose: Test Stripe integration
    - Features: Webhook testing, payment flow debugging

63. **Webhook Test** - `/webhook-test`
    - File: `src/app/webhook-test/page.tsx`
    - Purpose: Test webhook endpoints
    - Features: Simulate webhook calls

---

## 🧩 Complete Component Inventory (35 Components)

### 📐 Layout Components (3)

1. **AdminLayout** - `src/components/AdminLayout.tsx`
   - Purpose: Admin page wrapper with sidebar
   - Features: Navigation menu, role verification, breadcrumbs

2. **UserLayout** - `src/components/UserLayout.tsx`
   - Purpose: User profile page wrapper
   - Features: Profile header, navigation tabs, responsive

3. **RoleGuard** - `src/components/RoleGuard.tsx`
   - Purpose: Role-based access control
   - Features: Permission checking, unauthorized redirect

---

### 🎨 UI Framework Components (14)

**Standard UI Components** (10)
Location: `src/components/ui/`

4. **Accordion** - `src/components/ui/accordion.tsx`
   - Purpose: Collapsible content sections
   - Based on: Radix UI

5. **Badge** - `src/components/ui/badge.tsx`
   - Purpose: Status indicators and labels
   - Variants: default, secondary, destructive, outline

6. **Button** - `src/components/ui/button.tsx`
   - Purpose: Interactive buttons
   - Variants: default, destructive, outline, secondary, ghost, link
   - Sizes: default, sm, lg, icon

7. **Card** - `src/components/ui/card.tsx`
   - Purpose: Content containers
   - Sub-components: CardHeader, CardTitle, CardDescription, CardContent, CardFooter

8. **Input** - `src/components/ui/input.tsx`
   - Purpose: Text input fields
   - Features: Validation states, disabled states

9. **Label** - `src/components/ui/label.tsx`
   - Purpose: Form field labels
   - Based on: Radix UI

10. **Select** - `src/components/ui/select.tsx`
    - Purpose: Dropdown select menus
    - Based on: Radix UI
    - Features: Search, multi-select

11. **Tabs** - `src/components/ui/tabs.tsx`
    - Purpose: Tabbed navigation
    - Based on: Radix UI
    - Sub-components: TabsList, TabsTrigger, TabsContent

12. **Textarea** - `src/components/ui/textarea.tsx`
    - Purpose: Multi-line text input
    - Features: Auto-resize, character count

13. **RichTextEditor** - `src/components/ui/RichTextEditor.tsx`
    - Purpose: WYSIWYG editor for blog posts
    - Features: Bold, italic, links, images, formatting

14. **RichTextPreview** - `src/components/ui/RichTextPreview.tsx`
    - Purpose: Render rich text content
    - Features: Sanitization, safe HTML rendering

15. **RecipeImage** - `src/components/ui/RecipeImage.tsx`
    - Purpose: Optimized recipe images
    - Features: Lazy loading, fallback images

---

**Premium UI Components** (4)
Location: `src/components/ui/premium/`
**Design:** Glassmorphism, dark neutral backgrounds, premium wellness aesthetic

16. **PremiumButton** - `src/components/ui/premium/button.tsx`
    - Purpose: Glassmorphism buttons
    - Variants: primary, ghost, outline
    - Features: Backdrop blur, white/10 backgrounds, hover effects

17. **PremiumCard** - `src/components/ui/premium/card.tsx`
    - Purpose: Glass-effect cards
    - Features: bg-white/5, border-white/10, hover transitions
    - Sub-components: PremiumCardImage, PremiumCardContent, PremiumCardTitle, PremiumCardDescription, PremiumCardFooter

18. **PremiumInput** - `src/components/ui/premium/input.tsx`
    - Purpose: Glass-style form inputs
    - Features: Labels, error states, help text, backdrop blur

19. **PremiumBadge** - `src/components/ui/premium/badge.tsx`
    - Purpose: Pill-style status badges
    - Variants: default, success, warning, error

---

### 🧭 Navigation Components (4)

20. **Navbar** - `src/components/Navbar.tsx`
    - Purpose: Main site navigation
    - Features: Responsive menu, user dropdown, authentication state

21. **Footer** - `src/components/Footer.tsx`
    - Purpose: Site footer with links
    - Features: Social links, newsletter signup, sitemap

22. **CornerElements** - `src/components/CornerElements.tsx`
    - Purpose: Fixed corner UI elements
    - Features: Quick actions, floating buttons

23. **ThemeToggle** - `src/components/ThemeToggle.tsx`
    - Purpose: Dark/light mode switcher
    - Features: Persistent preference, smooth transition

---

### 🎯 Feature-Specific Components (9)

24. **ProfileHeader** - `src/components/ProfileHeader.tsx`
    - Purpose: User profile page header
    - Features: Avatar, name, membership status, stats

25. **NoFitnessPlan** - `src/components/NoFitnessPlan.tsx`
    - Purpose: Empty state for fitness plans
    - Features: CTA to generate plan

26. **UserPrograms** - `src/components/UserPrograms.tsx`
    - Purpose: Display user's fitness/diet programs
    - Features: Program cards, progress indicators

27. **GymLocationsSection** - `src/components/GymLocationsSection.tsx`
    - Purpose: Display all gym locations
    - Features: Location cards, maps integration

28. **LeafletMap** - `src/components/LeafletMap.tsx`
    - Purpose: Interactive map for locations
    - Features: Markers, popups, geolocation

29. **NewsletterSignup** - `src/components/NewsletterSignup.tsx`
    - Purpose: Email newsletter subscription
    - Features: Form validation, success state

30. **InventoryModal** - `src/components/InventoryModal.tsx`
    - Purpose: Admin inventory management modal
    - Features: Add/edit items, stock tracking

31. **ThemeAwareLogo** - `src/components/ThemeAwareLogo.tsx`
    - Purpose: Logo that adapts to theme
    - Features: Dark/light variants

32. **TerminalOverlay** - `src/components/TerminalOverlay.tsx`
    - Purpose: Developer debugging overlay
    - Features: Console logs, network requests

---

### 🤖 AI/Chat Components (2)

33. **ChadBot** - `src/components/ChadBot.tsx`
    - Purpose: AI chatbot for support
    - Features: Natural language, contextual responses

34. **ChatbaseWidget** - `src/components/ChatbaseWidget.tsx`
    - Purpose: Chatbase integration widget
    - Features: Third-party chat service

---

### 🛠️ Utility Components (1)

35. **NoSSR** - `src/components/NoSSR.tsx`
    - Purpose: Client-side only rendering
    - Features: Prevents hydration mismatches

---

## 🗄️ Database Schema (26 Tables)

### 👤 User & Authentication (2)

1. **users**
   - Fields: name, email, image, clerkId, role, accountType, organizationId, organizationRole
   - Roles: superadmin, admin, trainer, user
   - Account Types: personal, organization
   - Indexes: by_clerk_id, by_organization, by_account_type

2. **organizations**
   - Fields: clerkOrganizationId, name, slug, type, status, address, coordinates, phone, email, openingHours, is24Hours, features, adminId, totalMembers, totalStaff
   - Types: location, franchise
   - Status: active, inactive, pending
   - Indexes: by_clerk_org_id, by_slug, by_status, by_type, by_admin, by_state

---

### 🏋️ Training & Fitness (8)

3. **trainerApplications**
   - Fields: userId, clerkId, name, email, experience, certifications, motivation, status, submittedAt, reviewedAt, reviewedBy, notes
   - Status: pending, approved, rejected
   - Indexes: by_user, by_status

4. **trainerProfiles**
   - Fields: userId, clerkId, name, email, bio, specializations, experience, certifications, hourlyRate, profileImage, isActive, rating, totalReviews, totalSessions
   - Specializations: personal_training, zumba, yoga, crossfit, cardio, strength
   - Indexes: by_user, by_clerk_id, by_active, by_rating, by_specializations

5. **trainerAvailability**
   - Fields: trainerId, dayOfWeek, startTime, endTime, isRecurring, specificDate, isActive
   - Days: monday-sunday
   - Indexes: by_trainer, by_day, by_active, by_date

6. **bookings**
   - Fields: userId, trainerId, userClerkId, trainerClerkId, sessionType, date, startTime, endTime, duration, status, notes, price, paymentStatus, createdAt, updatedAt
   - Session Types: personal_training, zumba, yoga, crossfit, cardio, strength
   - Status: pending, confirmed, completed, cancelled
   - Payment Status: pending, paid, refunded
   - Indexes: by_user, by_trainer, by_date, by_status

7. **trainerReviews**
   - Fields: userId, trainerId, bookingId, rating, comment, createdAt
   - Indexes: by_user, by_trainer, by_booking, by_rating

8. **plans**
   - Fields: userId, name, workoutPlan (schedule, exercises), dietPlan (dailyCalories, meals), isActive
   - Indexes: by_user_id, by_active

9. **recipes**
   - Fields: title, description, imageUrl, category, cookingTime, servings, difficulty, calories, protein, carbs, fats, ingredients, instructions, tags, rating, isRecommended
   - Categories: breakfast, lunch, dinner, snack, pre-workout, post-workout, protein, healthy
   - Difficulty: easy, medium, hard
   - Indexes: by_category, by_recommended, by_difficulty, by_created_at

10. **attendanceRecords**
    - Fields: userId, clerkId, checkInTime, checkOutTime, locationId, date
    - Indexes: by_user, by_location, by_date

---

### 💳 Membership & Payments (2)

11. **memberships**
    - Fields: userId, clerkId, membershipType, status, stripeCustomerId, stripeSubscriptionId, stripePriceId, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd
    - Types: 18-month-minimum, 12-month-minimum, no-lock-in, 12-month-upfront
    - Status: active, cancelled, expired, pending
    - Indexes: by_user, by_clerk_id, by_stripe_customer, by_subscription, by_status

12. **membershipPlans**
    - Fields: name, description, price, currency, type, stripePriceId, stripeProductId, features, isActive, sortOrder
    - Indexes: by_type, by_active, by_sort_order

---

### 🛒 Marketplace (4)

13. **marketplaceItems**
    - Fields: name, description, price, category, imageUrl, status, stock, featured
    - Categories: supplements, equipment, apparel, accessories, nutrition
    - Status: active, inactive
    - Indexes: by_category, by_status, by_featured

14. **cartItems**
    - Fields: userId, itemId, quantity, addedAt
    - Indexes: by_user, by_item

15. **orders**
    - Fields: userId, items (array), totalAmount, status, shippingAddress, paymentIntentId, stripeSessionId, createdAt, updatedAt
    - Status: pending, processing, shipped, delivered, cancelled
    - Indexes: by_user, by_status, by_created_at

16. **inventory**
    - Fields: itemId, locationId, currentStock, reorderLevel, reorderQuantity, lastRestocked, updatedAt
    - Indexes: by_item, by_location

---

### 📝 Blog & Community (4)

17. **blogPosts**
    - Fields: title, slug, content, excerpt, author (userId, name, image), category, tags, coverImage, status, views, publishedAt, createdAt, updatedAt
    - Status: draft, published, archived
    - Indexes: by_author, by_category, by_status, by_slug, by_published_at

18. **blogComments**
    - Fields: postId, userId, userName, userImage, content, createdAt
    - Indexes: by_post, by_user

19. **blogLikes**
    - Fields: postId, userId, createdAt
    - Indexes: by_post, by_user, by_post_and_user

20. **newsletter**
    - Fields: email, subscribedAt, isActive
    - Indexes: by_email, by_active

---

### 💰 Salary Management (6)

21. **salaryStructures**
    - Fields: employeeId, employeeClerkId, baseSalary, allowances (array), deductions (array), effectiveFrom, effectiveTo, isActive, currency, paymentFrequency
    - Payment Frequency: monthly, bi-weekly, weekly
    - Indexes: by_employee, by_clerk_id, by_active

22. **payrollRecords**
    - Fields: employeeId, employeeClerkId, payPeriodStart, payPeriodEnd, baseSalary, allowances, deductions, grossPay, netPay, status, paymentDate, paymentMethod, notes
    - Status: pending, processed, paid, cancelled
    - Payment Method: bank_transfer, cash, cheque
    - Indexes: by_employee, by_clerk_id, by_status, by_pay_period

23. **salaryAdvances**
    - Fields: employeeId, employeeClerkId, amount, reason, status, requestDate, approvedBy, approvedDate, repaymentSchedule, remainingBalance
    - Status: pending, approved, rejected, repaid
    - Indexes: by_employee, by_status

24. **salaryAdjustments**
    - Fields: employeeId, employeeClerkId, adjustmentType, amount, reason, effectiveDate, createdBy, createdAt
    - Adjustment Types: bonus, deduction, overtime, commission
    - Indexes: by_employee, by_type

25. **generatedReports**
    - Fields: reportType, generatedBy, generatedAt, parameters, fileUrl, status
    - Report Types: payroll, attendance, performance
    - Status: generating, completed, failed
    - Indexes: by_type, by_generated_by

26. **attendanceRecords** (already listed above in Training section)

---

## 🔌 API Endpoints (24 Modules)

All endpoints are in `convex/` directory using Convex framework.

### Authentication & Users

1. **users.ts** - User management
   - Queries: getCurrentUser, getUserById, getAllUsers, getCurrentUserRole
   - Mutations: createUser, updateUser, deleteUser, updateUserRole

2. **auth.config.ts** - Clerk authentication configuration
   - Configuration: Clerk domain and application ID

---

### Organizations & Locations

3. **organizations.ts** - Organization/location management
   - Queries: getOrganizations, getOrganizationById, getOrganizationMembers
   - Mutations: createOrganization, updateOrganization, deleteOrganization

---

### Training & Fitness

4. **trainerProfiles.ts** - Trainer management
   - Queries: getAllTrainers, getTrainerById, getTrainerByClerkId, getTrainerStats, getActiveTrainers
   - Mutations: createTrainerProfile, updateMyTrainerProfile, updateTrainerRate, deactivateTrainer

5. **trainers.ts** - Trainer application system
   - Queries: getTrainerApplications, getMyApplication
   - Mutations: submitTrainerApplication, approveApplication, rejectApplication

6. **availability.ts** - Trainer availability
   - Queries: getTrainerAvailability, getAvailableTimeSlots
   - Mutations: setWeeklyAvailability, setSpecificDateAvailability, deleteAvailability

7. **bookings.ts** - Session bookings
   - Queries: getUserBookings, getTrainerBookings, getBookingById
   - Mutations: createBooking, updateBookingStatus, cancelBooking, rescheduleBooking

8. **reviews.ts** - Trainer reviews
   - Queries: getTrainerReviews, getUserReviews, getReviewStats
   - Mutations: createReview, updateReview, deleteReview

9. **plans.ts** - Fitness/diet plans
   - Queries: getUserPlans, getActivePlan, getPlanById
   - Mutations: createPlan, updatePlan, deletePlan, setActivePlan

10. **recipes.ts** - Recipe database
    - Queries: getAllRecipes, getRecipeById, getRecipesByCategory, searchRecipes
    - Mutations: createRecipe, updateRecipe, deleteRecipe

---

### Membership & Payments

11. **memberships.ts** - Membership subscriptions
    - Queries: getUserMembership, getUserMembershipWithExpiryCheck, getAllMemberships
    - Mutations: createMembership, updateMembership, cancelMembership

12. **http.ts** - Stripe webhooks
    - HTTP Routes: /stripe/webhook (handles subscription events)

---

### Marketplace

13. **marketplace.ts** - Product management
    - Queries: getMarketplaceItems, getItemById, getItemsByCategory, getFeaturedItems
    - Mutations: createItem, updateItem, deleteItem, updateStock

14. **cart.ts** - Shopping cart
    - Queries: getUserCart, getCartTotal
    - Mutations: addToCart, updateCartItem, removeFromCart, clearCart

15. **orders.ts** - Order processing
    - Queries: getUserOrders, getOrderById, getAllOrders
    - Mutations: createOrder, updateOrderStatus, cancelOrder

16. **inventory.ts** - Stock management
    - Queries: getInventoryByLocation, getLowStockItems, getInventoryByItem
    - Mutations: updateInventory, restockItem, transferStock

---

### Blog & Community

17. **blog.ts** - Blog posts
    - Queries: getAllPosts, getPostBySlug, getPostsByAuthor, getPostsByCategory
    - Mutations: createPost, updatePost, deletePost, publishPost, incrementViews

18. **blogComments.ts** - Post comments
    - Queries: getPostComments
    - Mutations: createComment, deleteComment

19. **blogLikes.ts** - Post likes (assumed, not explicitly seen)
    - Queries: getPostLikes, hasUserLiked
    - Mutations: toggleLike

20. **newsletter.ts** - Newsletter subscriptions
    - Queries: getAllSubscribers
    - Mutations: subscribe, unsubscribe

---

### Salary Management

21. **salary.ts** - Comprehensive salary system
    - Queries:
      - Structures: getEmployeeSalaryStructure, getAllSalaryStructures
      - Payroll: getEmployeePayrollRecords, getPayrollByPeriod, getPendingPayroll
      - Advances: getEmployeeAdvances, getPendingAdvances
      - Reports: generatePayrollReport
    - Mutations:
      - Structures: createSalaryStructure, updateSalaryStructure
      - Payroll: generatePayroll, processPayroll, markPayrollAsPaid
      - Advances: requestAdvance, approveAdvance, rejectAdvance
      - Adjustments: addSalaryAdjustment

---

### Database Management

22. **schema.ts** - Database schema definition (26 tables)

23. **migrations.ts** - Database migrations
    - Migrations: Version control for schema changes

---

### Testing/Seeding

24. **seedBlog.ts** - Blog data seeding
    - Mutations: seedBlogPosts (create sample content)

25. **seedBlogTest.ts** - Blog test data
    - Mutations: Test data generation

---

## 🎨 Context Providers (2)

1. **ConvexClerkProvider** - `src/providers/ConvexClerkProvider.tsx`
   - Purpose: Integrate Convex with Clerk authentication
   - Features: JWT token synchronization, authenticated queries

2. **ThemeProvider** - `src/providers/ThemeProvider.tsx`
   - Purpose: Dark/light mode management
   - Features: Theme persistence, system preference detection

---

## 🛠️ Utility Libraries (4)

1. **utils.ts** - `src/lib/utils.ts`
   - Purpose: General utility functions
   - Functions: cn() (className utility), date formatting, string helpers

2. **hydration-utils.ts** - `src/lib/hydration-utils.ts`
   - Purpose: Prevent hydration mismatches
   - Functions: Client-side rendering helpers, mounted state

3. **membership-utils.ts** - `src/lib/membership-utils.ts`
   - Purpose: Membership business logic
   - Functions: Expiry calculations, pricing logic, plan comparisons

4. **vapi.ts** - `src/lib/vapi.ts`
   - Purpose: Voice API integration
   - Features: Voice commands, speech-to-text

---

## 📦 Public Assets

Location: `public/`

- **Logos:**
  - `logo.png` - Main Derrimut logo (79KB)
  - `logo2.png` - Alternative logo (87KB)
  - `logos/` - Additional logo variants

- **Images:**
  - `hero-ai.png` - AI-themed hero image (1.1MB)

- **Favicons:**
  - `favicon.png` - Browser favicon
  - `favicon-official.png` - Official favicon

---

## 🏗️ Project Architecture Summary

### Technology Stack
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19
- **Styling:** Tailwind CSS 4
- **Backend:** Convex (real-time database + serverless functions)
- **Authentication:** Clerk
- **Payments:** Stripe
- **Language:** TypeScript (strict mode)

### Design Systems
1. **Standard Design:** shadcn/ui components (Radix UI primitives)
2. **Premium Design:** Glassmorphism, dark neutral backgrounds, wellness aesthetic

### User Roles & Permissions
- **Superadmin** - Platform-wide control
- **Admin** - Multi-location management
- **Location Admin** - Single location management (via organizations)
- **Trainer** - Session management, availability, reviews
- **User** - Memberships, bookings, marketplace, fitness tracking

### Key Features by Domain

**Fitness & Training:**
- AI-generated fitness plans
- Diet plan management
- Trainer booking system
- Availability management
- Session reviews & ratings
- Recipe database

**Business Operations:**
- Multi-location organization management
- Staff salary & payroll system
- Salary advances
- Attendance tracking
- Inventory management
- Marketplace (supplements/equipment)

**Member Engagement:**
- Membership tiers (4 types)
- Progress tracking
- Blog & community posts
- Newsletter subscription
- Review system

**E-commerce:**
- Product marketplace
- Shopping cart
- Stripe checkout
- Order tracking

**Content Management:**
- Blog posts (rich text)
- Comments & likes
- Recipe management
- SEO optimization

---

## 📊 Complexity Metrics

- **Total Routes:** 61 pages
- **Total Components:** 35 components
- **Database Tables:** 26 tables
- **API Modules:** 24 files
- **Lines of Schema:** ~906 lines
- **Role-Based Access:** 4 levels (superadmin, admin, trainer, user)
- **Payment Integration:** Stripe (subscriptions + one-time payments)
- **Real-time Features:** Convex reactive queries

---

## 🎯 Key Business Flows

### 1. Member Onboarding
```
Sign Up → Choose Membership → Stripe Payment → Profile Setup → Generate Fitness Plan → Start Training
```

### 2. Trainer Workflow
```
Apply → Admin Review → Approval → Profile Setup → Set Availability → Receive Bookings → Complete Sessions → Get Paid
```

### 3. Booking Flow
```
Browse Trainers → Select Trainer → Check Availability → Book Session → Payment → Confirmation → Session → Review
```

### 4. Marketplace Purchase
```
Browse Products → Add to Cart → Checkout → Stripe Payment → Order Created → Fulfillment → Delivery
```

### 5. Salary Processing
```
Define Structure → Track Attendance → Generate Payroll → Admin Approval → Process Payment → Generate Slip
```

---

## 🔐 Security & Permissions

### Authentication
- Clerk-based authentication
- JWT token validation via Convex
- Role-based access control (RBAC)

### Authorization Layers
1. **Page-level:** RoleGuard component
2. **API-level:** Convex query/mutation authorization
3. **Data-level:** User/organization scoping

### Protected Resources
- Admin routes require `admin` or `superadmin` role
- Trainer routes require `trainer` role
- Payroll data scoped to employee
- Organization data scoped to members

---

## 📈 Scalability Considerations

### Multi-Tenancy
- Organizations table supports multiple locations
- Each location has independent admin
- Data scoped by organizationId

### Performance
- Convex real-time queries (reactive)
- Index optimization on frequently queried fields
- Image optimization with Next.js Image component
- Client-side hydration prevention

### Extensibility
- Modular component structure
- Separation of UI (standard vs premium)
- API-first architecture (Convex functions)
- Type-safe interfaces throughout

---

*This inventory represents the complete state of the Derrimut Platform as of January 9, 2025.*
