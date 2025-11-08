# ✅ DERIMUT GYM PLATFORM - TRANSFORMATION CHECKLIST

## 📋 PHASE 1: PREPARATION & SETUP

### Environment Setup
- [ ] Create new Stripe account for Derrimut Gym
- [ ] Create Stripe products (AUD, fortnightly billing):
  - [ ] 18 Month Minimum Membership ($14.95 AUD/fortnight)
  - [ ] 12 Month Minimum Membership ($17.95 AUD/fortnight)
  - [ ] No Lock-in Contract Membership ($19.95 AUD/fortnight)
  - [ ] 12 Month Upfront Membership ($749 AUD one-time)
  - [ ] Casual Session Pass ($20 AUD)
- [ ] Create Stripe product for $88 AUD establishment fee
- [ ] Get Stripe Product IDs and Price IDs
- [ ] Set up Stripe webhook endpoint
- [ ] Update environment variables documentation
- [ ] Gather Derrimut Gym location data:
  - [ ] 18+ locations across VIC and SA (see DERIMUT_GYM_RESEARCH.md)
  - [ ] Get exact GPS coordinates for all locations
  - [ ] Get phone numbers for each location
- [ ] Obtain official Derrimut 24:7 Gym logo files
- [ ] Get brand color codes (Black, Red, Yellow)

### Code Preparation
- [ ] Create git branch: `feature/derrimut-transformation`
- [ ] Backup current codebase
- [ ] Review all files requiring updates (38+ files)

---

## 📋 PHASE 2: BRANDING TRANSFORMATION

### Core Branding Files
- [ ] Update `package.json` name field
- [ ] Update `README.md`:
  - [ ] Title and header
  - [ ] All "ELITE" references
  - [ ] Project description
  - [ ] Author information
- [ ] Update `src/app/layout.tsx`:
  - [ ] Metadata title
  - [ ] Metadata description

### Component Branding
- [ ] Update `src/components/Navbar.tsx`:
  - [ ] Logo text
  - [ ] Brand name display
- [ ] Update `src/components/Footer.tsx`:
  - [ ] Copyright text
  - [ ] Brand name
- [ ] Update `src/components/ThemeAwareLogo.tsx`:
  - [ ] Alt text
  - [ ] Logo references (if needed)
- [ ] Update `src/components/GymLocationsSection.tsx`:
  - [ ] Location names
  - [ ] Brand references

### Page Branding
- [ ] Update `src/app/page.tsx`:
  - [ ] Hero section text
  - [ ] All "ELITE" references
  - [ ] Statistics badges
  - [ ] Feature descriptions
- [ ] Update `src/app/about/page.tsx`
- [ ] Update `src/app/contact/page.tsx`
- [ ] Update `src/app/help/page.tsx`
- [ ] Update `src/app/privacy/page.tsx`
- [ ] Update `src/app/terms/page.tsx`
- [ ] Update `src/app/membership/page.tsx`
- [ ] Update `src/app/membership/success/page.tsx`
- [ ] Update `src/app/generate-program/page.tsx`
- [ ] Update `src/app/trainer/page.tsx`
- [ ] Update `src/app/trainer-booking/page.tsx`
- [ ] Update `src/app/become-trainer/page.tsx`
- [ ] Update `src/app/profile/page.tsx`
- [ ] Update `src/app/profile/settings/page.tsx`
- [ ] Update all admin pages (`src/app/admin/**/*.tsx`)

### Data Files
- [ ] Update `src/data/gymLocations.ts`:
  - [ ] Replace ELITE locations with Derrimut locations
  - [ ] Add all 18+ Derrimut locations (VIC and SA)
  - [ ] Update coordinates (verify via Google Maps API)
  - [ ] Update addresses (from DERIMUT_GYM_RESEARCH.md)
  - [ ] Update phone numbers (obtain from Derrimut website)
  - [ ] Add state and postcode fields
  - [ ] Update location IDs to match Derrimut naming

### Create Branding Constants (Recommended)
- [ ] Create `src/constants/branding.ts`:
  - [ ] BRAND_NAME: "Derrimut 24:7 Gym"
  - [ ] BRAND_SHORT: "Derrimut Gym"
  - [ ] BRAND_TAGLINE: "Believe in Yourself"
  - [ ] BRAND_COLORS: { primary: "#000000", secondary: "#[RED]", accent: "#[YELLOW]" }
  - [ ] CURRENCY: "AUD"
  - [ ] PAYMENT_FREQUENCY: "fortnightly"
- [ ] Define centralized branding constants
- [ ] Update all files to use constants

---

## 📋 PHASE 3: STRIPE CONFIGURATION

### Product ID Updates
- [ ] Update `convex/memberships.ts`:
  - [ ] Replace Basic product ID with 18 Month Minimum ($14.95/fortnight)
  - [ ] Replace Premium product ID with No Lock-in ($19.95/fortnight)
  - [ ] Replace Couple product ID with 12 Month Minimum ($17.95/fortnight)
  - [ ] Add 12 Month Upfront product ID ($749 one-time)
  - [ ] Add Establishment Fee product ID ($88 one-time)
  - [ ] Update all Stripe Price IDs
  - [ ] Change billing from monthly to fortnightly
- [ ] Update `convex/http.ts`:
  - [ ] Lines 402-416: Product ID mapping (update to Derrimut products)
  - [ ] Lines 590-602: Product ID fallback mapping (update to Derrimut products)
- [ ] Update `src/app/api/create-checkout-session/route.ts`:
  - [ ] Update to support fortnightly billing
  - [ ] Add establishment fee handling
  - [ ] Update currency to AUD

### Webhook Configuration
- [ ] Choose webhook handler (recommend Convex)
- [ ] Update webhook URL in Stripe dashboard
- [ ] Test webhook signature verification
- [ ] Remove duplicate handler (if consolidating)

---

## 📋 PHASE 4: CODE QUALITY IMPROVEMENTS

### Webhook Consolidation
- [ ] Review both webhook handlers:
  - [ ] `src/app/api/stripe-webhook/route.ts`
  - [ ] `convex/http.ts` → `/stripe-webhook`
- [ ] Decide on single handler (recommend Convex)
- [ ] Remove duplicate handler
- [ ] Update webhook URL in Stripe
- [ ] Test webhook processing

### Type Safety
- [ ] Fix `any` types in `convex/http.ts`
- [ ] Fix `any` types in `src/app/api/stripe-webhook/route.ts`
- [ ] Add proper TypeScript types for webhook handlers

### Error Handling
- [ ] Standardize error handling in API routes
- [ ] Add consistent error responses
- [ ] Improve error logging

### Configuration Management
- [ ] Move hardcoded values to environment variables
- [ ] Create configuration file for constants
- [ ] Document all configuration options

---

## 📋 PHASE 5: TESTING

### Authentication & User Management
- [ ] Test user registration
- [ ] Test user login
- [ ] Test user profile update
- [ ] Test role-based access control
- [ ] Test Clerk webhook sync

### Membership System
- [ ] Test Basic membership subscription
- [ ] Test Premium membership subscription
- [ ] Test Couple membership subscription
- [ ] Test membership cancellation
- [ ] Test membership renewal
- [ ] Test membership status updates
- [ ] Verify Stripe subscription creation
- [ ] Verify webhook processing

### Booking System
- [ ] Test trainer search
- [ ] Test availability checking
- [ ] Test booking creation
- [ ] Test booking payment flow
- [ ] Test booking confirmation
- [ ] Test booking cancellation
- [ ] Verify Stripe payment processing
- [ ] Verify webhook processing

### Marketplace
- [ ] Test product browsing
- [ ] Test cart functionality
- [ ] Test checkout flow
- [ ] Test order creation
- [ ] Test payment processing
- [ ] Test order tracking
- [ ] Verify Stripe payment processing
- [ ] Verify webhook processing

### AI Plan Generation
- [ ] Test Vapi voice call initiation
- [ ] Test voice consultation flow
- [ ] Test plan generation
- [ ] Test plan saving to database
- [ ] Test plan display in profile
- [ ] Verify Google Gemini API integration

### Admin Dashboard
- [ ] Test user management
- [ ] Test membership management
- [ ] Test trainer management
- [ ] Test inventory management
- [ ] Test blog management
- [ ] Test recipe management
- [ ] Test salary management
- [ ] Test all admin functions

### Content Management
- [ ] Test blog post creation
- [ ] Test blog comment system
- [ ] Test recipe creation
- [ ] Test content moderation

---

## 📋 PHASE 6: DEPLOYMENT PREPARATION

### Environment Variables
- [ ] Update `.env.local` with new values
- [ ] Update production environment variables
- [ ] Verify all API keys are correct
- [ ] Update webhook secrets

### Documentation
- [ ] Update README.md with Derrimut branding
- [ ] Update installation instructions
- [ ] Update environment variable documentation
- [ ] Update API documentation (if any)
- [ ] Update deployment guide

### Assets
- [ ] Replace logo files (if needed)
- [ ] Update favicon
- [ ] Update hero images (if needed)
- [ ] Verify all image paths

### Final Checks
- [ ] Run linter: `npm run lint`
- [ ] Fix all linting errors
- [ ] Run TypeScript check: `tsc --noEmit`
- [ ] Fix all TypeScript errors
- [ ] Test build: `npm run build`
- [ ] Verify build succeeds

---

## 📋 PHASE 7: DEPLOYMENT

### Pre-Deployment
- [ ] Create production build
- [ ] Review all changes
- [ ] Get approval for deployment
- [ ] Schedule deployment window

### Deployment Steps
- [ ] Deploy to staging environment
- [ ] Test all critical flows in staging
- [ ] Fix any staging issues
- [ ] Deploy to production
- [ ] Verify production deployment

### Post-Deployment
- [ ] Monitor error logs
- [ ] Test critical user flows
- [ ] Verify Stripe webhooks are working
- [ ] Verify all integrations are working
- [ ] Monitor for 24-48 hours

---

## 📋 PHASE 8: VALIDATION & MONITORING

### Functional Validation
- [ ] User registration works
- [ ] Membership subscriptions work
- [ ] Booking system works
- [ ] Marketplace works
- [ ] AI plan generation works
- [ ] Admin functions work
- [ ] All payments process correctly

### Integration Validation
- [ ] Stripe webhooks are processing
- [ ] Clerk webhooks are syncing users
- [ ] Vapi voice calls are working
- [ ] Google Gemini API is responding
- [ ] Email notifications (if any) are sending

### Performance Validation
- [ ] Page load times are acceptable
- [ ] API response times are acceptable
- [ ] Database queries are optimized
- [ ] No memory leaks

### Security Validation
- [ ] Authentication is working
- [ ] Authorization is enforced
- [ ] Webhook signatures are verified
- [ ] Environment variables are secure
- [ ] No sensitive data exposed

---

## 📋 PHASE 9: CLEANUP & OPTIMIZATION

### Code Cleanup
- [ ] Remove unused code
- [ ] Remove commented-out code
- [ ] Remove duplicate code
- [ ] Optimize imports
- [ ] Clean up console.logs (keep important ones)

### Documentation Cleanup
- [ ] Update inline comments
- [ ] Add JSDoc comments where needed
- [ ] Update README with latest info
- [ ] Document any new patterns

### Performance Optimization
- [ ] Optimize database queries
- [ ] Add caching where appropriate
- [ ] Optimize images
- [ ] Minimize bundle size

---

## 📊 PROGRESS TRACKING

### Overall Progress: 0% Complete

**Phase 1:** 0/8 tasks complete  
**Phase 2:** 0/40+ tasks complete  
**Phase 3:** 0/6 tasks complete  
**Phase 4:** 0/8 tasks complete  
**Phase 5:** 0/30+ tasks complete  
**Phase 6:** 0/12 tasks complete  
**Phase 7:** 0/8 tasks complete  
**Phase 8:** 0/15 tasks complete  
**Phase 9:** 0/8 tasks complete

---

## 🎯 PRIORITY TASKS (Do First)

1. ✅ **Create Stripe products** - Required for payment testing
2. ✅ **Update gym locations** - Required for location features
3. ✅ **Create branding constants** - Makes updates easier
4. ✅ **Update core branding files** - package.json, README, layout.tsx
5. ✅ **Update Stripe product IDs** - Required for payments to work

---

## 📝 NOTES

- **Estimated Time:** 2-3 days for complete transformation
- **Critical Path:** Stripe configuration → Branding → Testing → Deployment
- **Risk Areas:** Stripe webhook handling, payment flows, user data migration
- **Dependencies:** Stripe account setup, location data, branding assets

---

**Last Updated:** November 2025  
**Status:** Ready for Transformation

