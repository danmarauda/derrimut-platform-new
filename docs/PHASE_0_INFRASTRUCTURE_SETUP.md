# 🧪 PHASE 0: INFRASTRUCTURE SETUP
## Testing Infrastructure Configuration

**Status:** 🟡 In Progress  
**Started:** January 2025  
**Phase Duration:** 1 Week

---

## 🔧 CURRENT STATE ANALYSIS

### Issues Identified
1. **Convex Test Failures:** 42/42 tests failing - test setup not compatible with current Convex structure
2. **Stripe Mock Issues:** Mocks using incorrect constructor pattern  
3. **Test Suite Issues:** Invalid test files, wrong mock structure
4. **Role Guard Bug:** Superadmin access broken - critical auth issue

### Infrastructure Status
- ✅ Vitest configured with React support
- ✅ Basic test patterns established
- ✅ Coverage reporting configured (30% threshold)
- ❌ Convex mocking infrastructure broken
- ❌ Stripe integration tests non-functional
- ❌ Auth role hierarchy tests failing

---

## 🎯 IMMEDIATE FIXES REQUIRED

### 1. Fix Convex Test Infrastructure
```typescript
// Current issue: Tests calling .handler directly on mutation exports
// Problem: Convex exports are not standard functions with .handler property

// Fix approach: Use Convex's built-in test utilities
import { createMockFunction } from "convex/test";
```

### 2. Fix Stripe Mock Pattern  
```typescript
// Current issue: Using vi.fn() as constructor
const mockStripe = vi.fn(() => ({
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
}));

// Fix: Proper class mock
vi.mock("stripe", () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  })),
}));
```

### 3. Fix Role Guard Test Logic
Bug identified: Superadmin should have access to admin content but tests show "Access Denied"

---

## 📋 INFRASTRUCTURE SETUP PLAN

### Step 1: Fix Critical Test Issues (Day 1)
- [ ] Repair Convex test mocking pattern
- [ ] Fix Stripe constructor mocks  
- [ ] Resolve RoleGuard superadmin access bug
- [ ] Remove invalid test files

### Step 2: Enhanced Testing Setup (Day 2)
- [ ] Configure Playwright for E2E testing
- [ ] Set up test data fixtures and seeders
- [ ] Create mock external services (Stripe, Twilio, etc.)
- [ ] Configure performance monitoring baseline

### Step 3: CI/CD Pipeline Configuration (Day 3)
- [ ] Configure automated test pipeline
- [ ] Set up pre-commit hooks
- [ ] Configure coverage reporting
- [ ] Test deployment staging environment

### Step 4: Documentation & Workflow (Day 4-5)
- [ ] Update testing documentation
- [ ] Create development workflow guides
- [ ] Set up performance benchmarking
- [ ] Create reporting templates

---

## 🛠️ REQUIRED PACKAGES

Add to package.json:
```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "k6": "^0.47.0",
    "msw": "^2.0.0",
    "nock": "^13.4.0"
  }
}
```

---

## 📊 SUCCESS METRICS

### Testing Targets
- Unit test coverage: 80% minimum
- Integration tests: All critical user flows
- E2E tests: Core admin/member journeys  
- Performance: < 2s page load, < 500ms API response

### Infrastructure KPIs
- CI/CD pipeline: 100% automated
- Test execution time: < 5 minutes
- Coverage reporting: Automated
- Performance monitoring: Real-time dashboards

---

## 🚦 NEXT STEPS

1. **IMMEDIATE:** Fix Convex test imports and mocking
2. **TODAY:** Resolve Stripe mock Constructor errors  
3. **TOMORROW:** Install Playwright and configure E2E tests
4. **WEEK:** Complete full testing infrastructure

Once complete, we can proceed to Phase 1 with confidence that our testing foundation supports the sequential development plan.

---

## 🚨 BLOCKERS & RISKS

### Current Blockers
- Convex test mocking pattern incompatible with current structure
- Role hierarchy bug blocking superadmin functionality
- Missing E2E testing framework

### Mitigation Strategies
- Use Convex's recommended test utilities
- Implement role hierarchy fix immediately
- Parallel Playwright setup with test fixes

---

**Priority:** 🚨 CRITICAL - Must complete before Phase 1
**Timeline:** 1 Week
**Dependencies:** None (can start immediately)