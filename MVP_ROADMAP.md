# 🚀 Derrimut 24:7 Gym MVP Roadmap

**Document Version:** 1.0  
**Last Updated:** November 8, 2025  
**Audience:** ALIAS product, engineering, design, and AI teams  
**Goal:** Deliver a world-class MVP demo of the Derrimut Gym Platform for Adrian Portelli, showcasing an unprecedented AI-powered management platform.

---

## 📐 Guiding Principles

- **Demo First:** Build toward a compelling, stable demo that highlights AI, analytics, and operational excellence.
- **Brand Authenticity:** Keep all content, visuals, and messaging aligned with Derrimut 24:7 Gym’s identity.
- **Data Integrity:** Use realistic, well-structured demo data with clear separation from production data.
- **Security & Privacy:** Follow best practices for managing secrets, authentication, and Stripe test data.
- **Quality Bar:** Automated checks (type safety, linting), manual QA, and scripted demo flows before every review.
- **Documentation:** Keep roadmap, status, and demo instructions up-to-date for seamless hand-offs.

Reference docs:
- `MVP_BUILD_PLAN.md`
- `MVP_PROGRESS.md`
- `DERRIMUT_WEBSITE_SCRAPING.md`
- `PORTELLI_PROPOSAL.md`, `DEMO_SCRIPT.md`

---

## 🗺️ Phase Overview

| Phase | Timeline (est.) | Focus | Success Criteria |
|-------|-----------------|-------|------------------|
| 0. Discovery & Alignment | Week 0 | Objectives, branding, tech validation | Approved scope, assets, and environment access |
| 1. Brand & Foundation | Week 1 | Branding, layouts, constants, infrastructure | Branded app shell running locally with linting & type checks |
| 2. Core Platform API | Week 1-2 | Convex schema, CRUD, mock data | Convex backend with seed scripts & sample data |
| 3. Membership & Payments | Week 2-3 | Stripe integration, pricing logic | Stripe test flows working end-to-end |
| 4. AI & Voice Experience | Week 3-4 | Gemini + Vapi integration | Voice consultation generates viable plans |
| 5. Business Intelligence | Week 4 | Analytics dashboards, mock insights | Admin dashboard with KPI cards & charts |
| 6. Frontend Experience | Week 1-4 (parallel) | Member, staff, admin UX | Responsive UI, shadcn/ui patterns, accessibility |
| 7. QA & Hardening | Week 4-5 | Testing, docs, rehearsal | Zero critical bugs, walkthrough script finalized |
| 8. Launch & Demo | Week 5 | Demo prep, rehearsal, feedback | Successful live demo to Adrian Portelli |
| 9. Post-Demo | Week 5+ | Feedback, follow-up, roadmap v2 | Next-step plan aligned with stakeholder decision |

---

## 🎯 Phase 0: Discovery & Alignment

**Objectives:** Validate scope, gather assets, sync on expectations.

| Task | Owner | Best Practices | Done When |
|------|-------|---------------|-----------|
| Confirm demo vision & success metrics with stakeholders | Product Lead | Document via decision log | Vision documented in `PORTELLI_PROPOSAL.md` |
| Finalize brand assets (logos, colors, typography) | Design | Store under `/public/logos/` and `branding.ts` | All logos optimized, favicon updated |
| Audit existing codebase & dependencies | Tech Lead | Use `npm outdated`, assess Next.js 15/Tailwind v4 readiness | Issues documented in backlog |
| Access setup (Stripe test, Clerk, Convex, Vapi, Gemini) | Eng Ops | Store env vars in `.env.local`, `convex/.env` | All services accessible in test mode |

**Checkpoints:** Kickoff meeting, approved roadmap, env access verified.

---

## 🧬 Phase 1: Brand & Foundation (Week 1)

**Objectives:** Stand up branded shell with reliable tooling.

| Task | Owner | Best Practices | Done When |
|------|-------|---------------|-----------|
| Update global metadata & SEO (`layout.tsx`) | Frontend | Use `metadata` API, add OpenGraph tags | Title/description reflect Derrimut brand |
| Implement `ThemeAwareLogo` & brand constants | Frontend | Centralize in `src/constants/branding.ts` | Logos switch based on theme |
| Replace global navigation/footer content | Frontend | Leverage shadcn/ui + responsive nav patterns | Navbar/footer match brand copy |
| Configure ESLint, Prettier, TypeScript strict mode | Tech Lead | Enforce CI rules via `package.json` scripts | `npm run lint` & `tsc --noEmit` clean |
| Set up Tailwind & shadcn/ui design tokens | Design | Use Tailwind theme extension for colors/fonts | Components use theme tokens |
| Document style guide | Design | Add section to `MVP_PROGRESS.md` | Designers/devs aligned on UI specs |

**Success Criteria:** `npm run dev` shows branded skeleton; lint & type checks pass.

---

## 🗄️ Phase 2: Core Platform API (Week 1-2)

**Objectives:** Establish Convex schema, queries, mutations, and seed data.

| Task | Owner | Best Practices | Done When |
|------|-------|---------------|-----------|
| Finalize Convex schema (`convex/schema.ts`) | Backend | Add indexes, enums, timestamps, comments | Schema covers memberships, plans, locations, staff, AI plans |
| Implement seed scripts (membership plans, locations) | Backend | Use `convex/actions` for seeding, idempotent | `npm run convex:seed` populates demo data |
| Create CRUD mutations/queries for key models | Backend | Type-safe inputs via `convex/values`, handle errors | API supports memberships, bookings, analytics |
| Mock analytics aggregation functions | Backend | Use deterministic mock data, annotate real impl later | Admin dashboard returns sample KPIs |
| Establish data access patterns | Tech Lead | Use `ctx.auth` guard, role-based checks | Protected routes enforce roles |
| Document API surface | Backend | Update `MVP_PROGRESS.md` with API table | Devs know available endpoints |

**Success Criteria:** Convex dev server runs with seeded data; queries usable from Next.js.

---

## 💳 Phase 3: Membership & Payments (Week 2-3)

**Objectives:** Integrate Stripe for memberships, establishment fee, casual pass.

| Task | Owner | Best Practices | Done When |
|------|-------|---------------|-----------|
| Configure Stripe products/prices (test mode) | Eng Ops | Use standard naming conventions, map IDs in secrets | Products exist for all tiers + fees |
| Update `convex/memberships.ts` logic | Backend | Handle metadata mapping, status updates, cancellations | Membership operations sync with Stripe events |
| Implement Next.js API route `/api/create-checkout-session` | Backend | Validate Clerk user, guard price IDs | Checkout returns session URL |
| Set up Stripe webhooks (`convex/http.ts`) | Backend | Verify signatures, idempotent updates, log errors | Subscription lifecycle updates DB |
| Build membership management UI | Frontend | Provide clear pricing, highlight AUD/fortnight | Membership page matches Derrimut plans |
| Test flows end-to-end (success, cancel, retry) | QA | Use Stripe CLI to replay events | Test checklist signed off |

**Success Criteria:** Subscription purchase creates Convex membership; cancellation updates status; demo script ready.

---

## 🧠 Phase 4: AI & Voice Experience (Week 3-4)

**Objectives:** Deliver signature AI experience (Gemini + Vapi) with plan generation.

| Task | Owner | Best Practices | Done When |
|------|-------|---------------|-----------|
| Architect AI service layer | AI Lead | Separate prompt templates, use deterministic seeds for demo | `ai/` module handles plan generation |
| Integrate Google Gemini AI | AI Engineer | Implement retry/backoff, guardrails, JSON schema validation | AI returns structured workout/diet plan |
| Set up Vapi voice workflow | AI Engineer | Create conversation design, map metadata to session | Voice consultation produces transcript + plan |
| Build AI consultation UI (`/generate-program`) | Frontend | Real-time transcript, fallback for errors, accessible controls | Users can start/stop, view plan results |
| Store generated plans in Convex | Backend | Attach to user, track timestamps, allow re-generation | Member dashboard shows latest plan |
| QA AI outputs | QA/AI | Validate plan quality, fix prompt bias, ensure safe responses | AI outputs approved for demo |

**Success Criteria:** Voice session produces personalized plan visible in member dashboard.

---

## 📊 Phase 5: Business Intelligence Layer (Week 4)

**Objectives:** Showcase S-tier analytics with realistic demo data.

| Task | Owner | Best Practices | Done When |
|------|-------|---------------|-----------|
| Define KPI list & mock dataset | Product/Analytics | Align with Portelli priorities (revenue, retention, staff) | KPI sheet documented |
| Implement Convex analytics functions | Backend | Use deterministic mocks, flag TODO for real data | API returns metrics, trends, comparisons |
| Build admin dashboard UI (`/admin`) | Frontend | Use shadcn/ui components, responsive layout, accessible charts | Dashboard surfaces KPIs, charts, location filters |
| Add predictive insights cards | AI/Analytics | Provide “why it matters” context, actionable next steps | Insights look credible and aligned with business |
| Ensure role-based access | Tech Lead | Protect admin routes via Clerk + Convex role checks | Non-admins redirected |

**Success Criteria:** Admin can view KPIs, trends, and insights; demo data looks realistic.

---

## 🖥️ Phase 6: Frontend Experience (Weeks 1-4 parallel)

**Objectives:** Deliver polished member, staff, and admin experiences.

### Member Experience
- Landing page with Derrimut content (hero, testimonials, pricing, locations)
- Member dashboard (AI plans, bookings, activity summary)
- Membership page (pricing, FAQ, CTA)
- Location map/list (use seeded data, highlight closed/at-risk)

### Staff Experience
- Staff dashboard (schedule, client list, performance metrics)
- Trainer availability management
- Booking management flow

### Shared Components
- Toast notifications, modals, skeleton loaders
- Error boundaries for key routes
- Accessibility audit (color contrast, keyboard navigation)

**Best Practices:**
- Use server components for data-heavy pages; client components for interactions
- co-locate Convex hooks in `src/components/queries.ts`
- Optimize images with Next.js `Image`
- Use suspense boundaries & loading states

**Success Criteria:** Responsive, accessible UI; demo-ready flows for member, staff, admin personas.

---

## 🧪 Phase 7: QA, Performance & Hardening (Week 4-5)

| Task | Owner | Best Practices | Done When |
|------|-------|---------------|-----------|
| Write test plan (unit, integration, manual) | QA Lead | Focus on high-risk flows (AI, Stripe, analytics) | Test matrix approved |
| Add automated checks | Engineering | Use `@testing-library/react`, Convex test utilities | Critical utilities covered |
| Performance profiling | Frontend | Lighthouse run, ensure hydration warnings resolved | Lighthouse >90 on key pages |
| Security review | Tech Lead | Verify env handling, secret rotation, webhook security | Checklist signed |
| Demo data reset script | Engineering | Provide script to reseed dataset quickly | `npm run demo:reset` works |
| Rehearsal dry run | Product/Engineering | Follow `DEMO_SCRIPT.md`, capture feedback | Dry run recorded, issues logged |

---

## 🚀 Phase 8: Launch & Demo (Week 5)

| Task | Owner | Best Practices | Done When |
|------|-------|---------------|-----------|
| Finalize demo environment | Eng Ops | Deploy to Vercel (or similar), use protected URL | Demo URL stable |
| Prepare demo script & deck | Product | Align with `PORTELLI_PROPOSAL.md`, highlight business value | Demo assets finalized |
| Conduct rehearsal with stakeholders | Product/Exec | Include Q&A, contingency planning | Sign-off obtained |
| Execute live demo to Adrian Portelli | Executive Team | Follow script, emphasize AI, analytics, ops simplicity | Demo delivered successfully |

---

## 🔄 Phase 9: Post-Demo Follow-up

| Task | Owner | Best Practices | Done When |
|------|-------|---------------|-----------|
| Capture feedback & decisions | Product | Record in decision log, share to team | Feedback doc circulated |
| Update roadmap for next version | Product/Tech | Prioritize production readiness tasks | V2 backlog created |
| Archive demo data & prepare prod plan | Engineering | Reset environments, plan for real data migration | Ready for next engagement |

---

## ✅ Best Practice Checklist

- [ ] `.env.local` and `convex/.env` managed securely (never commit secrets)
- [ ] Clerk roles set for admin/staff/member personas
- [ ] Convex schema documented with comments and indexes
- [ ] Stripe webhook signatures verified, idempotency keys used
- [ ] AI prompts versioned and validated (JSON schema)
- [ ] Vapi workflows tested with network failure scenarios
- [ ] TypeScript strict mode enabled (`"strict": true`)
- [ ] ESLint + Prettier run on pre-commit (Husky optional)
- [ ] Storybook (optional) for key components if time allows
- [ ] Lighthouse performance & accessibility targets met
- [ ] `DEMO_SCRIPT.md` rehearsed with accurate data states

---

## 🔁 Operating Rhythm & Communication

- **Weekly Sync:** Review roadmap progress, unblock issues.
- **Daily Stand-up:** 10-min updates (Slack or call).
- **Demo Rehearsal:** Twice in final week.
- **Status Updates:** Update `MVP_PROGRESS.md` after major milestones.
- **Issue Tracking:** Use project board (e.g., Linear/Jira) with labels per phase.

---

## 📎 Appendices

- **A. Reference Documents:** See `/docs` for research, proposals, scripts.
- **B. Environment Checklist:** `.env` template with required keys.
- **C. Demo Data Spec:** Define sample users, memberships, analytics scenarios.
- **D. Risk Register:** Maintain in `MVP_PROGRESS.md` (Stripe, AI, admin uncertainty).

---

**Let’s build something unprecedented.**  
For questions or updates, sync with the Product or Tech Lead.
