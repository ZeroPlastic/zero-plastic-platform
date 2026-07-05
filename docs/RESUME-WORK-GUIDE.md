# Resume Work Guide - Day 4
## Zero Plastic Platform - Phase 1 Backend

### Current Status
✅ M0.1/M0.2: Auth + RBAC schema and service (21 tests passing)
✅ M0.3: User Service — Profile/UserTier/Achievement schema added (63 tests passing, full suite total)
⏳ M0.4: Club Service - NEXT
⏳ M0.5: Integration - THEN
⏳ Phase 3: React Frontend - THEN

**Schema reality check:** the database currently has **10 tables** — `User`, `Profile`,
`Achievement`, `UserAchievement`, `RefreshToken`, `OtpCode`, `Role`, `Permission`,
`RolePermission`, `UserRole`. There is **no Club, Project, Event, Finance, or Asset
table yet** — M0.4 builds the Club schema from scratch, it does not extend an
existing one. (An earlier draft of this guide claimed "18 tables" — that referred to
a planning document that was never actually implemented in this repo.)

### To Resume (Day 4)

1. Pull latest code:
   ```
   git pull origin main
   ```

2. Verify everything (run from `backend/`, not the repo root — there is no root-level `package.json`):
   ```
   cd backend
   npm test
   ```
   Expect: `Test Suites: 4 passed, 4 total` / `Tests: 63 passed, 63 total`.

3. Ask Claude Code to generate M0.4:

PROMPT:
```
PROJECT: Zero Plastic Platform - M0.4 Club Service
TASK: Generate complete club management service

STATUS: M0.1/M0.2 (auth) ✓, M0.3 (user service) ✓ — 63 tests passing, all committed.
No Club table exists yet — this module starts from zero, including the schema.

CREATE:
1. Prisma schema additions: Club (self-referential parent/children, ClubType enum:
   NATIONAL/PROVINCIAL/DISTRICT/UNIVERSITY/SCHOOL/INSTITUTIONAL/COMMUNITY),
   ClubMember (join: User <-> Club with permissions/officer role), ClubCommittee,
   ClubCommitteeMember — then migrate to Azure and regenerate the Prisma Client
2. src/services/clubService.ts
3. src/repositories/clubRepository.ts
4. src/controllers/clubController.ts
5. src/routes/clubRoutes.ts
6. src/tests/unit/clubService.test.ts
7. src/tests/unit/clubRepository.test.ts
8. src/tests/integration/clubController.test.ts
9. Mount club routes in src/app.ts (there is no src/routes/index.ts yet —
   routes are currently mounted directly in app.ts, same pattern as /auth and /users)
10. Seed data for testing (a few sample clubs across the hierarchy)

FEATURES:
✓ Create club (7 types: NATIONAL, PROVINCIAL, DISTRICT, UNIVERSITY, SCHOOL, INSTITUTIONAL, COMMUNITY)
✓ Get club with members and hierarchy
✓ List clubs with pagination and filters
✓ Add club member with permissions
✓ Remove member
✓ Create committee
✓ Add committee member
✓ Get club hierarchy (parent + children)
✓ List subordinate clubs
✓ Soft delete handling
✓ >80% test coverage (on the files with dedicated tests — verify with `npm test`, don't just assert it)

OUTPUT: Create all files directly in Codespaces, tests included. Build (tsc) and
run the test suite before calling this done — don't report success without
actually running it.
```

### After M0.4 Tests Pass:
4. Commit M0.4 — include the schema/migration files, not just `backend/src/`
   (the club service depends on the Club/ClubMember/ClubCommittee models, which
   live in `backend/prisma/`, not under `src/`):
   ```
   git add backend/src/ backend/prisma/schema.prisma backend/prisma/migrations/
   git commit -m "M0.4: Club Service - X tests passing"
   git push origin main
   ```
   (Replace X with the actual number reported by `npm test` — check before committing.)

5. Ask Claude Code to generate M0.5:

PROMPT:
```
PROJECT: Zero Plastic Platform - M0.5 Integration
TASK: Integrate all services, complete backend

STATUS: M0.1/M0.2 (auth), M0.3 (user), M0.4 (club) all committed.

CREATE/UPDATE:
1. src/routes/index.ts - Mount all routes (auth, user, club) — this file doesn't
   exist yet; routes are currently mounted directly in app.ts, so this is a
   refactor, not just an update
2. src/app.ts - Wire routes/index.ts in place of the individual route imports
3. src/tests/integration/api.test.ts - Full API integration tests
4. Update package.json scripts if needed

VERIFY (actually run these, don't just check the boxes):
✓ All routes mounted
✓ All middleware working
✓ All tests passing
✓ >80% coverage on tested files
✓ No console.log left in source
✓ Proper error handling
✓ Production-ready
```

### After M0.5 Tests Pass:
6. Commit M0.5 (same note as step 4 — check for non-`src/` dependencies first):
   ```
   git add backend/src/
   git commit -m "M0.5: Integration complete - backend Phase 1 done"
   git push origin main
   ```

### Then: Phase 3 React Frontend (5-6 hours for UI)
Ask Claude Code to create React app with:
- Registration page (calls `/auth/register`)
- Login page (calls `/auth/login`)
- Dashboard (shows user profile via `/users/me`)

### Timeline When Resuming:
Day 4:  M0.4 Club Service (4-5 hours)
Day 5:  M0.5 Integration (2-3 hours)
Day 6:  Phase 3 React UI (3-4 hours)
Day 7:  Finishing touches (1-2 hours)

By END OF DAY 7: WORKING REGISTRATION/LOGIN IN BROWSER! 🎉

### Important Files — actually at the repo ROOT, not `/docs/`
`/docs/` currently only holds a short `README.md`. These planning docs live at the
top level of the repo instead:
- `PHASE-1-EXECUTION-ROADMAP.md`
- `ENHANCED-PRISMA-SCHEMA-V2.md`
- `AI-WORKFLOW-ARCHITECTURE-PROMPTS.md`
- `ZERO_PLASTIC_EXECUTIVE_SUMMARY.md`
- `ZERO_PLASTIC_MODULAR_DEV_ROADMAP.md`
- `ZERO_PLASTIC_TECH_SETUP_GUIDE.md`
- `M0.2-AUTH-COMPLETE.md` — ⚠️ describes an older auth design (different JWT
  payload shape, hardcoded fallback secret) that doesn't match what's actually
  implemented in `backend/src/`. Worth reconciling or deleting so it stops being
  a second, contradictory source of truth.

There is **no** `DATABASE-ARCHITECTURE-DESIGN.md` anywhere in this repo.

### GitHub
All code committed to: github.com/ZeroPlastic/zero-plastic-platform
Branch: main

Happy resuming! 🚀
