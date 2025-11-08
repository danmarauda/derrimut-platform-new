# Claude Flow Hivemind Context
## Derrimut Platform Production Readiness

**Last Updated:** January 9, 2025  
**Status:** Ready for Execution

---

## 🎯 PROJECT OVERVIEW

**Project:** Derrimut 24:7 Gym Platform  
**Type:** Next.js 15 Full-Stack Application  
**Target:** Production deployment on Vercel  
**Current Status:** 65/100 Production Ready

### Tech Stack
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Backend:** Convex (real-time database)
- **Auth:** Clerk
- **Payments:** Stripe
- **AI:** Vapi (voice), Google Gemini (plan generation)
- **Components:** shadcn/ui

---

## 📋 CURRENT STATE

### ✅ What's Working
- Core infrastructure (80% complete)
- Authentication & authorization
- Payment integration
- AI features (Vapi + Gemini)
- Frontend components
- Database schema (26 tables)

### ❌ Critical Issues
1. **No tests** - 0% coverage
2. **Build errors ignored** - Dangerous for production
3. **No error tracking** - Can't debug production issues
4. **No error boundaries** - App crashes on errors
5. **Type safety** - 246 `any` types

### ⚠️ High Priority Issues
1. Input validation inconsistent
2. No rate limiting
3. No CSRF protection
4. Duplicate webhook handlers
5. No monitoring

---

## 🚀 EXECUTION PLAN

### Agent Assignments

**Agent 1: Testing Specialist**
- Tasks: 1.1, 1.2
- Focus: Jest setup, test writing
- Deliverables: Testing infrastructure, 20+ tests

**Agent 2: Error Handling & Monitoring**
- Tasks: 1.3, 1.4, 3.2, 4.2
- Focus: Error boundaries, Sentry, logging, monitoring
- Deliverables: Error tracking, monitoring system

**Agent 3: Type Safety & Code Quality**
- Tasks: 1.5, 3.1, 3.3
- Focus: TypeScript fixes, code cleanup
- Deliverables: Type-safe code, clean codebase

**Agent 4: Security Specialist**
- Tasks: 1.6, 2.1, 2.2, 2.3, 2.4, 4.3
- Focus: Validation, rate limiting, CSRF, webhooks
- Deliverables: Secure, validated code

**Agent 5: Performance Engineer**
- Tasks: 4.1, 5.5
- Focus: Performance optimization, media storage
- Deliverables: Optimized performance

**Agent 6: Documentation & Deployment**
- Tasks: 5.1, 5.2, 5.3, 5.4
- Focus: Documentation, Vercel configuration
- Deliverables: Complete docs, production setup

### Task Phases

**Phase 1: Critical Fixes (Week 1)**
- Testing infrastructure
- Error boundaries & tracking
- Build configuration
- Environment validation

**Phase 2: Security & Validation (Week 2)**
- Input validation
- Rate limiting
- CSRF protection
- Webhook consolidation

**Phase 3: Type Safety & Quality (Week 2)**
- Fix `any` types
- Standardize error handling
- Code cleanup

**Phase 4: Performance & Monitoring (Week 2)**
- Performance optimization
- Monitoring setup
- Security headers

**Phase 5: Documentation & Deployment (Week 3)**
- Documentation updates
- Vercel configuration
- SSL/DNS setup
- Media optimization

---

## 🔑 KEY INFORMATION

### Environment Variables
- **Convex:** `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`
- **Clerk:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- **Stripe:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Vapi:** `NEXT_PUBLIC_VAPI_API_KEY`, `NEXT_PUBLIC_VAPI_WORKFLOW_ID`
- **Gemini:** `GEMINI_API_KEY`

### Important IDs
- **Vapi Workflow:** `e13b1b19-3cd5-42ab-ba5d-7c46bf989a6e`
- **Convex Dev:** `enchanted-salamander-914`
- **Convex Prod:** `spotted-gerbil-236`

### Key Files
- **Execution Plan:** `HIVEMIND_EXECUTION_PLAN.md`
- **Task Breakdown:** `HIVEMIND_TASK_BREAKDOWN.md`
- **Production Checklist:** `PRODUCTION_LAUNCH_CHECKLIST.md`
- **Analysis:** `PRODUCTION_READINESS_ANALYSIS.md`

### Code Patterns

**Convex Functions:**
- Always validate env vars before use
- Use `ctx.auth` for authentication
- Check roles for authorization

**API Routes:**
- Validate inputs with Zod
- Handle errors consistently
- Return proper status codes

**Components:**
- Use RoleGuard for protected pages
- Handle loading/error states
- Use ErrorBoundary for error handling

---

## 📝 EXECUTION GUIDELINES

### For All Agents

1. **Read First:**
   - `HIVEMIND_EXECUTION_PLAN.md` - Full plan
   - `PRODUCTION_READINESS_ANALYSIS.md` - Current state
   - `CRUSH.md` - Quick reference

2. **Before Starting:**
   - Check dependencies
   - Review related files
   - Understand acceptance criteria

3. **While Working:**
   - Follow TypeScript best practices
   - Write tests for new code
   - Document changes
   - Update progress in plan

4. **Before Completing:**
   - Verify acceptance criteria met
   - Run tests
   - Check for linting errors
   - Update documentation

### Code Standards

- **TypeScript:** Use proper types, avoid `any`
- **Error Handling:** Use standardized patterns
- **Validation:** Use Zod schemas
- **Testing:** Write tests for critical paths
- **Documentation:** Update relevant docs

### File Naming

- Tests: `*.test.tsx` or `*.test.ts`
- Utilities: `src/lib/*.ts`
- Validations: `src/lib/validations/*.ts`
- Types: `src/types/*.ts`

---

## 🎯 SUCCESS CRITERIA

### Phase 1 Complete When:
- ✅ Jest runs successfully
- ✅ 20+ tests written and passing
- ✅ Error boundaries implemented
- ✅ Sentry tracking errors
- ✅ Build succeeds without ignores
- ✅ Env validation working

### Phase 2 Complete When:
- ✅ All inputs validated
- ✅ Rate limiting active
- ✅ CSRF protection working
- ✅ Single webhook handler

### Phase 3 Complete When:
- ✅ Critical `any` types fixed
- ✅ Error handling standardized
- ✅ Code cleaned up

### Phase 4 Complete When:
- ✅ Performance optimized
- ✅ Monitoring active
- ✅ Security headers set

### Phase 5 Complete When:
- ✅ Documentation updated
- ✅ Vercel configured
- ✅ Deployment ready

---

## 🔧 QUICK COMMANDS

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run linter
npm test                 # Run tests (after setup)

# Convex
npx convex dev           # Start Convex dev
npx convex logs          # View logs

# Stripe
npm run stripe:test-webhooks  # Test webhooks

# Vapi
npm run vapi:setup-auto       # Setup workflow
npm run vapi:update-voice     # Update voice

# Deployment
vercel --prod            # Deploy to production
vercel env ls            # List env vars
```

---

## 📚 REFERENCE DOCUMENTATION

- **Full Plan:** `HIVEMIND_EXECUTION_PLAN.md`
- **Task Breakdown:** `HIVEMIND_TASK_BREAKDOWN.md`
- **Quick Start:** `HIVEMIND_QUICK_START.md`
- **Production Checklist:** `PRODUCTION_LAUNCH_CHECKLIST.md`
- **Analysis:** `PRODUCTION_READINESS_ANALYSIS.md`
- **Code Reference:** `CRUSH.md`
- **Project Inventory:** `docs/COMPREHENSIVE-PROJECT-INVENTORY.md`

---

## 🚨 CRITICAL REMINDERS

1. **Never ignore build errors** - Fix them!
2. **Always validate inputs** - Use Zod
3. **Handle errors gracefully** - Use error boundaries
4. **Write tests** - Especially for critical paths
5. **Document changes** - Update relevant docs
6. **Check dependencies** - Before starting tasks
7. **Verify acceptance criteria** - Before marking complete

---

**Context Version:** 1.0  
**Last Updated:** January 9, 2025  
**Status:** Ready for Hivemind Execution

