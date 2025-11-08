# 🎯 Hivemind Agent Instructions

## For All Agents

### Before Starting Your Tasks

1. **Read the Context**
   - Read `.claude-flow/hivemind-context.md`
   - Review `HIVEMIND_EXECUTION_PLAN.md` for your assigned tasks
   - Check `PRODUCTION_READINESS_ANALYSIS.md` for current state

2. **Understand Dependencies**
   - Check if your tasks have dependencies
   - Wait for dependent tasks to complete (or coordinate)
   - Verify prerequisites are met

3. **Review Codebase**
   - Understand the project structure
   - Review similar existing code
   - Check coding patterns and conventions

### While Working

1. **Follow Standards**
   - Use TypeScript properly (avoid `any`)
   - Follow existing code patterns
   - Write tests for new code
   - Document your changes

2. **Update Progress**
   - Mark tasks as complete in `HIVEMIND_EXECUTION_PLAN.md`
   - Update this file with your progress
   - Communicate blockers immediately

3. **Code Quality**
   - Run `npm run lint` before committing
   - Fix TypeScript errors
   - Write meaningful commit messages
   - Test your changes

### After Completing

1. **Verify Acceptance Criteria**
   - All acceptance criteria met
   - Tests passing
   - No linting errors
   - Documentation updated

2. **Update Documentation**
   - Update relevant docs
   - Add comments where needed
   - Update README if necessary

3. **Mark Complete**
   - Update task status
   - Document any issues encountered
   - Share learnings with team

---

## Agent-Specific Instructions

### Agent 1: Testing Specialist

**Focus:** Testing infrastructure and test writing

**Key Files:**
- `jest.config.js` (create)
- `jest.setup.js` (create)
- `src/__tests__/utils.tsx` (create)
- Test files in `src/__tests__/` and `convex/__tests__/`

**Important:**
- Mock Convex hooks properly
- Mock Clerk authentication
- Test critical user flows
- Aim for >30% coverage

**Commands:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest ts-jest
npm test
npm run test:coverage
```

---

### Agent 2: Error Handling & Monitoring

**Focus:** Error boundaries, Sentry, logging, monitoring

**Key Files:**
- `src/components/ErrorBoundary.tsx`
- `src/app/error.tsx`
- `src/app/global-error.tsx`
- `sentry.*.config.ts`
- `src/lib/logger.ts`
- `src/app/api/health/route.ts`

**Important:**
- Use react-error-boundary library
- Configure Sentry properly
- Set up structured logging
- Create health check endpoint

**Commands:**
```bash
npm install react-error-boundary @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
npm install winston  # or pino
```

---

### Agent 3: Type Safety & Code Quality

**Focus:** TypeScript fixes, code cleanup

**Key Files:**
- `src/types/index.ts` (create)
- `next.config.ts` (remove ignore flags)
- Files with `any` types (fix)

**Important:**
- Remove `ignoreBuildErrors` and `ignoreDuringBuilds`
- Fix TypeScript errors progressively
- Create shared types
- Clean up TODOs and dead code

**Commands:**
```bash
tsc --noEmit  # Check for errors
npm run lint  # Check linting
npm run build # Verify build succeeds
```

---

### Agent 4: Security Specialist

**Focus:** Validation, rate limiting, CSRF, webhooks, headers

**Key Files:**
- `src/lib/env.ts`
- `src/lib/validations/**/*.ts`
- `src/lib/rate-limit.ts`
- `src/lib/csrf.ts`
- `convex/http.ts` (webhook consolidation)
- `next.config.ts` (security headers)

**Important:**
- Use Zod for validation
- Implement rate limiting on all APIs
- Add CSRF protection
- Consolidate webhook handlers
- Configure security headers

**Commands:**
```bash
npm install zod express-rate-limit csrf
```

---

### Agent 5: Performance Engineer

**Focus:** Performance optimization, media storage

**Key Files:**
- Component files (add React.lazy)
- Convex query files (optimize)
- API routes (add caching)
- Image components (optimize)

**Important:**
- Use React.lazy() for code splitting
- Optimize database queries
- Add API response caching
- Move large media to blob storage

**Commands:**
```bash
# Performance testing
npm run build
# Check bundle sizes
# Optimize images
```

---

### Agent 6: Documentation & Deployment

**Focus:** Documentation, Vercel configuration

**Key Files:**
- `docs/API.md`
- `docs/RUNBOOKS.md`
- `docs/ARCHITECTURE.md`
- `DEPLOYMENT_CHECKLIST.md`
- `ROLLBACK_PLAN.md`
- `INCIDENT_RESPONSE_PLAN.md`
- `VERCEL_CONFIGURATION.md`
- `README.md`

**Important:**
- Document all APIs
- Create runbooks for operations
- Configure Vercel features
- Plan DNS migration
- Document incident response

**Commands:**
```bash
# Vercel configuration
vercel env ls
vercel --prod
```

---

## Communication Protocol

### Daily Updates

Update `.claude-flow/progress.md` with:
- Tasks completed today
- Tasks in progress
- Blockers or issues
- Next steps

### Blockers

If blocked:
1. Document the blocker
2. Check if another agent can help
3. Update task status
4. Continue with other tasks if possible

### Coordination

- Agent 1 & Agent 2: Coordinate on error handling tests
- Agent 3 & Agent 4: Coordinate on type safety for validation
- Agent 2 & Agent 6: Coordinate on monitoring documentation
- All agents: Share learnings and patterns

---

## Progress Tracking

Update this file as you complete tasks:

### Agent 1 Progress
- [ ] Task 1.1: Testing Infrastructure Setup
- [ ] Task 1.2: Write Critical Path Tests

### Agent 2 Progress
- [ ] Task 1.3: Error Boundaries Implementation
- [ ] Task 1.4: Error Tracking Setup (Sentry)
- [ ] Task 3.2: Standardize Error Handling
- [ ] Task 4.2: Monitoring Setup

### Agent 3 Progress
- [ ] Task 1.5: Fix Build Configuration
- [ ] Task 3.1: Fix Critical `any` Types
- [ ] Task 3.3: Code Cleanup

### Agent 4 Progress
- [ ] Task 1.6: Environment Variable Validation
- [ ] Task 2.1: Input Validation (Zod)
- [ ] Task 2.2: Rate Limiting Implementation
- [ ] Task 2.3: CSRF Protection
- [ ] Task 2.4: Consolidate Webhook Handlers
- [ ] Task 4.3: Security Headers

### Agent 5 Progress
- [ ] Task 4.1: Performance Optimization
- [ ] Task 5.5: Media & Storage Optimization

### Agent 6 Progress
- [ ] Task 5.1: Update Documentation
- [ ] Task 5.2: Deployment Preparation
- [ ] Task 5.3: Vercel Production Configuration
- [ ] Task 5.4: SSL & DNS Configuration

---

**Last Updated:** January 9, 2025  
**Status:** Ready for Execution

