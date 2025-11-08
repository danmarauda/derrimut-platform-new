# 🎯 DERIMUT GYM PLATFORM - TRANSFORMATION QUICK REFERENCE

## 🚨 CRITICAL FILES TO UPDATE

### 1. Branding Updates (38 files)
```bash
# Files with "ELITE" branding that need updates:
- package.json
- README.md
- src/app/layout.tsx
- src/components/Navbar.tsx
- src/components/Footer.tsx
- src/app/page.tsx
- src/data/gymLocations.ts
- [35+ more files - see FORENSIC_CODEBASE_ANALYSIS.md]
```

### 2. Stripe Product IDs
**Files:**
- `convex/memberships.ts` (lines 488, 508, 524)
- `convex/http.ts` (lines 402-416, 590-602)

**Current IDs:**
- Basic: `prod_SrnVL6NvWMhBm6`
- Couple: `prod_SrnXKx7Lu5TgR8`
- Premium: `prod_SrnZGVhLm7A6oW`

**Action:** Create new Stripe products for Derrimut and update these IDs

### 3. Gym Locations
**File:** `src/data/gymLocations.ts`

**Current:** ELITE Gym locations in Kandy  
**Action:** Replace with Derrimut Gym locations

### 4. Webhook Handlers
**Files:**
- `src/app/api/stripe-webhook/route.ts` (Next.js handler)
- `convex/http.ts` (Convex handler)

**Action:** Consolidate to single handler (recommend keeping Convex)

---

## 🔄 TRANSFORMATION STEPS

### Step 1: Create Branding Constants
Create `src/constants/branding.ts`:
```typescript
export const BRAND = {
  NAME: "Derrimut Gym Platform",
  SHORT: "Derrimut Gym",
  FULL: "Derrimut Gym & Fitness",
  TAGLINE: "Your Fitness Journey, Powered By Derrimut",
} as const;
```

### Step 2: Update Package.json
```json
{
  "name": "derrimut-gym-platform",
  ...
}
```

### Step 3: Update Stripe Products
1. Create new products in Stripe dashboard
2. Update product IDs in code
3. Update price IDs

### Step 4: Update Locations
Replace `src/data/gymLocations.ts` with Derrimut locations

### Step 5: Global Find & Replace
```bash
# Replace all instances:
"ELITE Gym" → "Derrimut Gym"
"ELITE GYM" → "Derrimut Gym"
"Elite Gym" → "Derrimut Gym"
"EliteGym" → "DerrimutGym"
```

---

## ✅ PRE-TRANSFORMATION CHECKLIST

- [ ] Backup current codebase
- [ ] Create new Stripe account/products
- [ ] Gather Derrimut Gym location data
- [ ] Prepare new branding assets (logos, etc.)
- [ ] Review all environment variables
- [ ] Plan webhook handler consolidation

---

## 🧪 POST-TRANSFORMATION TESTING

### Critical Tests:
1. ✅ User registration/login
2. ✅ Membership subscription flow
3. ✅ Booking system
4. ✅ Marketplace checkout
5. ✅ AI plan generation
6. ✅ Admin dashboard functions
7. ✅ Payment webhooks
8. ✅ Email notifications (if any)

---

## 📞 SUPPORT RESOURCES

- **Full Analysis:** See `FORENSIC_CODEBASE_ANALYSIS.md`
- **Stripe Docs:** https://stripe.com/docs
- **Convex Docs:** https://docs.convex.dev
- **Next.js Docs:** https://nextjs.org/docs

