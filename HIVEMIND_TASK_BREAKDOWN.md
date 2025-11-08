# 🎯 Hivemind Task Breakdown - Structured Format

## Task Structure for Parallel Execution

### PHASE 1: CRITICAL FIXES

#### TASK-1.1: Testing Infrastructure Setup
**Agent:** Agent-1  
**Priority:** CRITICAL  
**Dependencies:** None  
**Files to Create:**
- `jest.config.js`
- `jest.setup.js`
- `src/__tests__/utils.tsx`

**Commands to Run:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest ts-jest
```

**Acceptance:** Jest runs, test setup complete

---

#### TASK-1.2: Write Critical Path Tests
**Agent:** Agent-1  
**Priority:** CRITICAL  
**Dependencies:** TASK-1.1  
**Files to Create:**
- `src/__tests__/auth.test.tsx`
- `src/__tests__/payments.test.tsx`
- `src/__tests__/api.test.ts`
- `convex/__tests__/memberships.test.ts`
- `src/components/__tests__/RoleGuard.test.tsx`

**Acceptance:** 20+ tests, >30% coverage, all pass

---

#### TASK-1.3: Error Boundaries Implementation
**Agent:** Agent-2  
**Priority:** CRITICAL  
**Dependencies:** None  
**Files to Create:**
- `src/components/ErrorBoundary.tsx`
- `src/app/error.tsx`
- `src/app/global-error.tsx`

**Files to Modify:**
- `src/app/layout.tsx`

**Commands to Run:**
```bash
npm install react-error-boundary
```

**Acceptance:** Errors caught gracefully

---

#### TASK-1.4: Error Tracking Setup (Sentry)
**Agent:** Agent-2  
**Priority:** CRITICAL  
**Dependencies:** TASK-1.3  
**Files to Create:**
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `instrumentation.ts`

**Files to Modify:**
- `next.config.ts`
- `src/components/ErrorBoundary.tsx`
- `ENVIRONMENT_KEYS_GUIDE.md`

**Commands to Run:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Acceptance:** Errors logged to Sentry

---

#### TASK-1.5: Fix Build Configuration
**Agent:** Agent-3  
**Priority:** CRITICAL  
**Dependencies:** None  
**Files to Modify:**
- `next.config.ts` (remove ignore flags)
- Fix TypeScript errors in affected files
- Fix ESLint errors

**Acceptance:** Build succeeds without ignores

---

#### TASK-1.6: Environment Variable Validation
**Agent:** Agent-4  
**Priority:** CRITICAL  
**Dependencies:** None  
**Files to Create:**
- `src/lib/env.ts`

**Files to Modify:**
- `src/app/layout.tsx`
- `ENVIRONMENT_KEYS_GUIDE.md`

**Commands to Run:**
```bash
npm install zod
```

**Acceptance:** Env vars validated on startup

---

### PHASE 2: SECURITY & VALIDATION

#### TASK-2.1: Input Validation (Zod)
**Agent:** Agent-4  
**Priority:** HIGH  
**Dependencies:** TASK-1.6  
**Files to Create:**
- `src/lib/validations/membership.ts`
- `src/lib/validations/booking.ts`
- `src/lib/validations/marketplace.ts`
- `src/lib/validations/user.ts`
- `src/lib/validations/utils.ts`

**Files to Modify:**
- `src/app/api/create-checkout-session/route.ts`
- `src/app/api/create-marketplace-checkout/route.ts`
- `src/app/api/create-session-checkout/route.ts`
- `convex/http.ts`

**Acceptance:** All inputs validated

---

#### TASK-2.2: Rate Limiting Implementation
**Agent:** Agent-4  
**Priority:** HIGH  
**Dependencies:** None  
**Files to Create:**
- `src/lib/rate-limit.ts`

**Files to Modify:**
- `src/app/api/**/*.ts`

**Commands to Run:**
```bash
npm install express-rate-limit
```

**Acceptance:** Rate limiting active on all APIs

---

#### TASK-2.3: CSRF Protection
**Agent:** Agent-4  
**Priority:** HIGH  
**Dependencies:** None  
**Files to Create:**
- `src/lib/csrf.ts`

**Files to Modify:**
- Form components
- API routes

**Commands to Run:**
```bash
npm install csrf
```

**Acceptance:** CSRF protection working

---

#### TASK-2.4: Consolidate Webhook Handlers
**Agent:** Agent-4  
**Priority:** HIGH  
**Dependencies:** None  
**Files to Modify:**
- `convex/http.ts` (enhance)
- `src/app/api/stripe-webhook/route.ts` (remove or deprecate)
- `STRIPE_CONVEX_RULES.md` (update)

**Acceptance:** Single webhook handler, idempotent

---

### PHASE 3: TYPE SAFETY & CODE QUALITY

#### TASK-3.1: Fix Critical `any` Types
**Agent:** Agent-3  
**Priority:** HIGH  
**Dependencies:** TASK-1.5  
**Files to Create:**
- `src/types/index.ts`

**Files to Modify:**
- `convex/http.ts` (15 instances)
- `convex/memberships.ts` (10 instances)
- `src/app/admin/salary/structures/page.tsx` (21 instances)
- `src/app/admin/recipes/page.tsx` (10 instances)

**Acceptance:** Critical `any` types fixed, 50%+ reduction

---

#### TASK-3.2: Standardize Error Handling
**Agent:** Agent-2  
**Priority:** HIGH  
**Dependencies:** TASK-1.4  
**Files to Create:**
- `src/lib/errors.ts`
- `src/lib/error-handler.ts`

**Files to Modify:**
- `src/app/api/**/*.ts`
- `convex/**/*.ts`

**Acceptance:** Consistent error handling

---

#### TASK-3.3: Code Cleanup
**Agent:** Agent-3  
**Priority:** MEDIUM  
**Dependencies:** None  
**Files to Modify:**
- Remove TODOs
- Remove dead code
- Fix duplication
- Refactor large files

**Acceptance:** Clean codebase

---

### PHASE 4: PERFORMANCE & MONITORING

#### TASK-4.1: Performance Optimization
**Agent:** Agent-5  
**Priority:** MEDIUM  
**Dependencies:** None  
**Files to Modify:**
- Add React.lazy() to components
- Optimize Convex queries
- Add API caching
- Optimize images

**Acceptance:** Performance improved

---

#### TASK-4.2: Monitoring Setup
**Agent:** Agent-2  
**Priority:** MEDIUM  
**Dependencies:** TASK-1.4  
**Files to Create:**
- `src/lib/logger.ts`
- `src/app/api/health/route.ts`

**Files to Modify:**
- Add logging throughout

**Commands to Run:**
```bash
npm install winston
# or
npm install pino
```

**Acceptance:** Monitoring active

---

#### TASK-4.3: Security Headers
**Agent:** Agent-4  
**Priority:** MEDIUM  
**Dependencies:** None  
**Files to Modify:**
- `next.config.ts`

**Acceptance:** Security headers present

---

### PHASE 5: DOCUMENTATION & DEPLOYMENT

#### TASK-5.1: Update Documentation
**Agent:** Agent-6  
**Priority:** MEDIUM  
**Dependencies:** All previous tasks  
**Files to Create:**
- `docs/API.md`
- `docs/RUNBOOKS.md`
- `docs/ARCHITECTURE.md`

**Files to Modify:**
- `README.md`

**Acceptance:** Documentation complete

---

#### TASK-5.2: Deployment Preparation
**Agent:** Agent-6  
**Priority:** MEDIUM  
**Dependencies:** All previous tasks  
**Files to Create:**
- `DEPLOYMENT_CHECKLIST.md`
- `ROLLBACK_PLAN.md`
- `BACKUP_STRATEGY.md`

**Acceptance:** Deployment ready

---

## Execution Timeline

### Week 1 (Days 1-5)
**Parallel Execution:**
- Agent-1: TASK-1.1, TASK-1.2
- Agent-2: TASK-1.3, TASK-1.4
- Agent-3: TASK-1.5
- Agent-4: TASK-1.6, TASK-2.1

### Week 2 (Days 6-10)
**Parallel Execution:**
- Agent-1: Continue tests
- Agent-2: TASK-3.2, TASK-4.2
- Agent-3: TASK-3.1, TASK-3.3
- Agent-4: TASK-2.2, TASK-2.3, TASK-2.4, TASK-4.3
- Agent-5: TASK-4.1

### Week 3 (Days 11-15)
**Parallel Execution:**
- Agent-6: TASK-5.1, TASK-5.2
- All agents: Final review and fixes

---

## Quick Reference Commands

### Setup Commands (Run Once)
```bash
# Testing
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest ts-jest

# Error Handling
npm install react-error-boundary @sentry/nextjs

# Validation & Security
npm install zod express-rate-limit csrf

# Logging (choose one)
npm install winston
# or
npm install pino
```

### Verification Commands
```bash
# Run tests
npm test

# Check types
tsc --noEmit

# Lint
npm run lint

# Build
npm run build
```

---

## Progress Tracking

Update this section as tasks complete:

### Phase 1: Critical Fixes
- [ ] TASK-1.1: Testing Infrastructure Setup
- [ ] TASK-1.2: Write Critical Path Tests
- [ ] TASK-1.3: Error Boundaries Implementation
- [ ] TASK-1.4: Error Tracking Setup (Sentry)
- [ ] TASK-1.5: Fix Build Configuration
- [ ] TASK-1.6: Environment Variable Validation

### Phase 2: Security & Validation
- [ ] TASK-2.1: Input Validation (Zod)
- [ ] TASK-2.2: Rate Limiting Implementation
- [ ] TASK-2.3: CSRF Protection
- [ ] TASK-2.4: Consolidate Webhook Handlers

### Phase 3: Type Safety & Code Quality
- [ ] TASK-3.1: Fix Critical `any` Types
- [ ] TASK-3.2: Standardize Error Handling
- [ ] TASK-3.3: Code Cleanup

### Phase 4: Performance & Monitoring
- [ ] TASK-4.1: Performance Optimization
- [ ] TASK-4.2: Monitoring Setup
- [ ] TASK-4.3: Security Headers

### Phase 5: Documentation & Deployment
- [ ] TASK-5.1: Update Documentation
- [ ] TASK-5.2: Deployment Preparation

---

**Status:** Ready for execution  
**Last Updated:** January 9, 2025

