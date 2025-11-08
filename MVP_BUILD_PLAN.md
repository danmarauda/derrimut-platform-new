# 🚀 DERRIMUT GYM MVP BUILD PLAN
## Demo-Ready Platform for Adrian Portelli

**Target Date:** ASAP  
**Purpose:** Live demonstration to Adrian Portelli  
**Scope:** MVP with core features showcasing unprecedented capabilities

---

## 🎯 MVP SCOPE

### Core Features to Build:

#### 1. **Member Experience (Priority 1)**
- ✅ Landing page with Derrimut branding
- ✅ AI Voice Consultation (wow factor)
- ✅ AI-generated fitness plans display
- ✅ Member dashboard
- ✅ Trainer booking system (basic)
- ✅ Multi-location selector

#### 2. **Business Intelligence Dashboard (Priority 1)**
- ✅ Executive dashboard with key metrics
- ✅ Real-time revenue tracking
- ✅ Location comparison
- ✅ Member analytics
- ✅ Predictive insights (churn, forecasting)

#### 3. **Staff Dashboard (Priority 2)**
- ✅ Staff login and dashboard
- ✅ Scheduling interface
- ✅ Performance metrics
- ✅ Client management

#### 4. **Admin/Operations (Priority 2)**
- ✅ Multi-location management
- ✅ Member management
- ✅ Basic analytics

### Out of Scope for MVP:
- ❌ Full payroll system (show concept)
- ❌ Complete marketplace (show concept)
- ❌ Full inventory management (show concept)
- ❌ Complete blog system (not critical for demo)

---

## 🎨 BRANDING ASSETS NEEDED

### Required Assets:
1. **Logo Files:**
   - [ ] Primary logo (PNG, transparent background)
   - [ ] Logo variations (horizontal, vertical, icon)
   - [ ] Favicon

2. **Brand Colors:**
   - [ ] Primary color (Black)
   - [ ] Secondary color (Red - exact hex)
   - [ ] Accent color (Yellow - exact hex)
   - [ ] Additional brand colors

3. **Brand Guidelines:**
   - [ ] Typography (fonts)
   - [ ] Spacing guidelines
   - [ ] Logo usage rules

4. **Images:**
   - [ ] Hero images
   - [ ] Gym facility photos
   - [ ] Equipment photos

---

## 📋 MVP BUILD CHECKLIST

### Phase 1: Branding & Setup (Day 1-2)
- [ ] Gather Derrimut branding assets
- [ ] Create branding constants file
- [ ] Update all UI components with Derrimut branding
- [ ] Replace logos throughout platform
- [ ] Update color scheme
- [ ] Update typography
- [ ] Create favicon

### Phase 2: Core Platform (Day 3-5)
- [ ] Set up Derrimut-specific data structure
- [ ] Update gym locations (26+ Derrimut locations)
- [ ] Create membership plans (Derrimut pricing)
- [ ] Set up Stripe products (demo/test mode)
- [ ] Update authentication flow
- [ ] Create member dashboard

### Phase 3: AI Features (Day 6-8)
- [ ] Implement voice AI consultation
- [ ] Connect Google Gemini AI
- [ ] Create plan generation flow
- [ ] Build plan display components
- [ ] Add progress tracking

### Phase 4: Business Intelligence (Day 9-11)
- [ ] Build executive dashboard
- [ ] Create analytics components
- [ ] Implement real-time metrics
- [ ] Add location comparison
- [ ] Build predictive analytics (mock data for demo)
- [ ] Create financial dashboard

### Phase 5: Staff Features (Day 12-13)
- [ ] Build staff dashboard
- [ ] Create scheduling interface
- [ ] Add performance metrics
- [ ] Build client management

### Phase 6: Polish & Demo Prep (Day 14-15)
- [ ] Load demo data
- [ ] Test all features
- [ ] Fix bugs
- [ ] Optimize performance
- [ ] Create demo script walkthrough
- [ ] Prepare backup slides

---

## 🗂️ FILE STRUCTURE FOR MVP

```
derrimut-platform/
├── src/
│   ├── constants/
│   │   └── branding.ts          # Derrimut branding constants
│   ├── app/
│   │   ├── page.tsx             # Landing page (Derrimut branded)
│   │   ├── generate-program/    # AI consultation
│   │   ├── profile/             # Member dashboard
│   │   ├── admin/                # Business intelligence
│   │   └── staff/                # Staff dashboard
│   ├── components/
│   │   ├── DerrimutLogo.tsx     # Derrimut logo component
│   │   └── [other components]
│   └── data/
│       └── derrimutLocations.ts # 26+ Derrimut locations
├── public/
│   ├── logos/
│   │   ├── derrimut-logo.png
│   │   ├── derrimut-logo-white.png
│   │   └── favicon.ico
│   └── images/
│       └── [Derrimut gym photos]
```

---

## 🎨 BRANDING IMPLEMENTATION PLAN

### Step 1: Create Branding Constants
```typescript
// src/constants/branding.ts
export const DERRIMUT_BRAND = {
  name: "Derrimut 24:7 Gym",
  short: "Derrimut Gym",
  tagline: "Believe in Yourself",
  colors: {
    primary: "#000000",    // Black
    secondary: "#[RED]",    // TBD - need exact hex
    accent: "#[YELLOW]",    // TBD - need exact hex
  },
  logo: {
    primary: "/logos/derrimut-logo.png",
    white: "/logos/derrimut-logo-white.png",
    favicon: "/logos/favicon.ico",
  },
  currency: "AUD",
  paymentFrequency: "fortnightly",
} as const;
```

### Step 2: Update Key Files
1. `package.json` - Update name
2. `src/app/layout.tsx` - Update metadata
3. `src/components/Navbar.tsx` - Update branding
4. `src/components/Footer.tsx` - Update branding
5. `src/app/page.tsx` - Update landing page
6. All other pages - Update branding references

### Step 3: Replace Assets
1. Add Derrimut logos to `/public/logos/`
2. Update logo references
3. Update favicon
4. Add Derrimut gym photos

---

## 📍 LOCATION DATA SETUP

### Derrimut Locations (26+ locations)
- Need to update `src/data/gymLocations.ts` with:
  - All 26 Derrimut locations
  - Exact addresses
  - GPS coordinates (verify via Google Maps)
  - Phone numbers
  - State and postcode

### Location Structure:
```typescript
export const derrimutLocations = [
  {
    id: "derrimut-derrimut",
    name: "Derrimut 24:7 Gym - Derrimut",
    address: "2 Makland Dr, Derrimut VIC 3030",
    lat: -37.8167,
    lng: 144.7667,
    phone: "+61 3 XXXX XXXX",
    state: "VIC",
    postcode: "3030",
    status: "operational", // vs "closed" or "at_risk"
  },
  // ... 25+ more locations
];
```

---

## 💳 STRIPE SETUP (Demo Mode)

### Test Products to Create:
1. **18 Month Minimum** - $14.95 AUD/fortnight
2. **12 Month Minimum** - $17.95 AUD/fortnight  
3. **No Lock-in** - $19.95 AUD/fortnight
4. **12 Month Upfront** - $749 AUD
5. **Establishment Fee** - $88 AUD
6. **Casual Pass** - $20 AUD

### Stripe Configuration:
- Use Stripe Test Mode
- Create test products
- Get test product IDs
- Update code with test IDs

---

## 🤖 AI FEATURES SETUP

### Voice AI (Vapi):
- [ ] Set up Vapi account
- [ ] Create workflow for Derrimut
- [ ] Configure voice consultation
- [ ] Test voice flow

### Google Gemini AI:
- [ ] Verify API key
- [ ] Test plan generation
- [ ] Optimize prompts for Derrimut
- [ ] Test output quality

---

## 📊 DEMO DATA SETUP

### Sample Data Needed:
1. **Members:**
   - 5-10 demo member accounts
   - Various membership types
   - Sample activity data

2. **Staff:**
   - 3-5 demo staff accounts
   - Various roles
   - Sample performance data

3. **Locations:**
   - All 26 locations loaded
   - Sample usage data per location

4. **Analytics:**
   - Sample revenue data
   - Sample member metrics
   - Sample staff metrics
   - Predictive insights (can be mock for demo)

---

## 🚀 QUICK START GUIDE

### Immediate Actions:

1. **Gather Branding Assets** (Today)
   - Download Derrimut logos
   - Get brand color codes
   - Collect gym photos

2. **Set Up Branding** (Today)
   - Create branding constants
   - Update core files
   - Replace logos

3. **Update Locations** (Today)
   - Add all Derrimut locations
   - Verify coordinates
   - Update location data

4. **Set Up Stripe** (Today)
   - Create test products
   - Get test product IDs
   - Update code

5. **Build Core Features** (Next 2 weeks)
   - Follow MVP checklist
   - Focus on demo features
   - Test thoroughly

---

## ✅ MVP SUCCESS CRITERIA

### Must Have for Demo:
- ✅ Derrimut branding throughout
- ✅ AI voice consultation working
- ✅ Business intelligence dashboard functional
- ✅ Member dashboard working
- ✅ Staff dashboard working
- ✅ Multi-location support
- ✅ Demo data loaded
- ✅ All features tested

### Nice to Have:
- ⭐ Complete marketplace
- ⭐ Full payroll system
- ⭐ Complete inventory management
- ⭐ Blog system

---

## 📝 NOTES

- **Focus:** Demo-ready features, not production-ready
- **Data:** Can use mock data for analytics if needed
- **Timeline:** 2 weeks to MVP
- **Priority:** Features that wow Portelli
- **Branding:** Must be perfect - first impression matters

---

**Let's build something amazing! 🚀**

