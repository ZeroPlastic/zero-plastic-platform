# ZERO PLASTIC PLATFORM
## AI Development Workflow - Architecture Prompts for M0.3-M0.5

These are the system prompts to use with Claude Code for rapid, high-quality implementation.

---

## PROMPT 1: M0.3 USER SERVICE IMPLEMENTATION
### Use this with Claude Code for user service development

```
PROJECT CONTEXT:
- Zero Plastic Movement volunteer platform
- Backend: Node.js + Express + TypeScript + Prisma
- Database: PostgreSQL with 18 tables
- Architecture: Service → Repository → Controller → Route pattern
- Status: M0.1 (schema) ✅ M0.2 (auth) ✅  Now implementing M0.3

TASK: Implement M0.3 User Service
Build complete user management service with TypeScript/Prisma.

REQUIREMENTS:
1. UserService class with methods:
   - getUser(userId: string) - fetch user with profile
   - getUserByEmail(email: string)
   - listUsers(filters, pagination) - list with search
   - updateProfile(userId, data) - update user profile
   - changePassword(userId, oldPassword, newPassword)
   - updateUserRole(userId, newRole) - admin only
   - suspendUser(userId) - admin only
   - activateUser(userId)
   - searchUsers(query, type) - search by email/phone/name

2. UserRepository class:
   - All database queries using Prisma
   - Include soft deletes (@include {where: {deletedAt: null}})
   - Proper error handling

3. UserController class:
   - REST handlers for each service method
   - Input validation with Joi
   - Proper HTTP status codes
   - Error responses with AppError

4. UserRoutes:
   - GET /api/users/:id - get user
   - GET /api/users - list users (with pagination, filters)
   - PUT /api/users/:id - update profile
   - POST /api/users/:id/change-password
   - POST /api/users/:id/suspend (admin)
   - POST /api/users/:id/activate (admin)
   - GET /api/users/search/:query

5. Unit tests:
   - Test each service method
   - Test error cases
   - Mock Prisma calls
   - Aim for >80% coverage

CODE STANDARDS:
- TypeScript strict mode
- Use @/ paths for imports
- Error handling with custom AppError classes
- Joi for input validation
- Never expose passwordHash in responses
- Soft delete queries: {where: {deletedAt: null}}
- Indexes must match Prisma schema

RESPONSE FORMAT:
- For list endpoints: {data: [...], pagination: {total, page, pageSize, pages}}
- For single: {data: {...}, message: "..."}
- For errors: {error, message, code, details}

DEPENDENCIES AVAILABLE:
- prisma, bcrypt, jsonwebtoken, joi, express

OUTPUT:
Generate complete, production-ready code. Each file ready to copy/paste into VSCode.

PATTERNS:
- Service handles business logic
- Repository handles database access
- Controller handles HTTP
- All errors caught and formatted

NO MOCK DATA - real Prisma queries
NO COMMENTS except complex logic
NO TODO - complete implementation
```

---

## PROMPT 2: M0.4 CLUB SERVICE IMPLEMENTATION
### Use this with Claude Code for club service development

```
PROJECT CONTEXT:
- Zero Plastic backend (M0.1 ✅ M0.2 ✅ M0.3 [in progress])
- Implementing Club management with hierarchy, committees, operations

TASK: Implement M0.4 Club Service
Build comprehensive club management for NATIONAL → PROVINCIAL → DISTRICT → INSTITUTIONAL hierarchy.

REQUIREMENTS:
1. ClubService class:
   - createClub(data: {name, type, presidentId, ...})
   - getClub(clubId)
   - listClubs(filters: {type?, parentClubId?, district?, ...}, pagination)
   - updateClub(clubId, data)
   - addMember(clubId, userId, role?, permissions?)
   - removeMember(clubId, userId)
   - listMembers(clubId, pagination)
   - makeOfficer(clubId, userId, officerRole)
   - createCommittee(clubId, {name, chairpersonId})
   - addCommitteeMember(committeeId, userId, role)
   - removeCommitteeMember(committeeId, userId)
   - getClubHierarchy(clubId) - show parent + children
   - listSubordinateClubs(clubId) - all clubs under this one
   - searchClubs(query)

2. ClubRepository class:
   - All Prisma queries for club operations
   - Include soft deletes
   - Optimized queries (include relations efficiently)
   - Handle hierarchy queries (parent/child)

3. ClubController class:
   - REST handlers for all club operations
   - Authorization checks (president, admin)
   - Input validation

4. ClubRoutes:
   - POST /api/clubs - create club (admin)
   - GET /api/clubs - list clubs
   - GET /api/clubs/:id - get club with members
   - PUT /api/clubs/:id - update club
   - POST /api/clubs/:id/members - add member
   - DELETE /api/clubs/:id/members/:userId - remove member
   - POST /api/clubs/:id/officers - make officer
   - GET /api/clubs/:id/hierarchy - parent + children
   - GET /api/clubs/:id/subordinates - all under this
   - POST /api/clubs/:id/committees - create committee
   - POST /api/clubs/:id/committees/:committeeId/members - add committee member
   - GET /api/clubs/:id/committees - list committees
   - GET /api/clubs/search/:query - search

5. Unit tests:
   - Club creation
   - Hierarchy operations
   - Member management
   - Committee operations
   - Error cases

BUSINESS RULES:
- NATIONAL clubs have no parent
- PROVINCIAL clubs parent to NATIONAL
- DISTRICT clubs parent to PROVINCIAL
- Lower-level clubs parent to DISTRICT
- Only club president can add members (with limits)
- Admin can override permissions
- Committee chairperson must be club member
- Soft deletes: always filter {deletedAt: null}

AUTHORIZATION:
- createClub: SYSTEM_ADMIN only
- updateClub: President or NATIONAL_DIRECTOR
- addMember: President or Officer with permission
- createCommittee: President or Officer
- All list endpoints: any authenticated user

OUTPUT:
Production-ready code, ready to copy/paste.
```

---

## PROMPT 3: M0.5 API ROUTES & INTEGRATION
### Use this with Claude Code for final integration

```
PROJECT CONTEXT:
- Zero Plastic backend (M0.1 ✅ M0.2 ✅ M0.3 [done] M0.4 [done])
- All services implemented, now integrate into Express API

TASK: Implement M0.5 Express Routes & Integration
Connect all services into production-ready API with validation, middleware, error handling.

REQUIREMENTS:
1. Update src/routes/index.ts:
   - Import all route files: authRoutes, userRoutes, clubRoutes, projectRoutes
   - Mount at correct paths: /api/auth, /api/users, /api/clubs, /api/projects
   - Health check endpoint

2. Create validation schemas (src/utils/schemas.ts):
   - For each POST/PUT endpoint
   - Joi schemas for request validation
   - Export as named objects: createUserSchema, updateClubSchema, etc

3. Create middleware chain (src/middleware/index.ts):
   - authMiddleware (verify JWT)
   - requireRole(...roles) - role-based access
   - validateRequest(schema) - Joi validation
   - errorHandler - catch all errors
   - logger - request logging
   - Order: logger → validate → auth → handler → errorHandler

4. Add request/response logging:
   - All requests logged with timestamp, method, path
   - Response time tracked
   - Errors logged with stack trace
   - 404s logged as debug

5. API Documentation:
   - Add Swagger/OpenAPI comments to routes
   - Generate /api-docs endpoint
   - All endpoints documented with:
     - Method, path
     - Required auth
     - Request body schema
     - Response schema
     - Error codes

6. Rate limiting (optional but recommended):
   - /api/auth endpoints: 5 requests per minute
   - /api/users endpoints: 60 per minute
   - Other: 100 per minute

7. CORS setup:
   - Allow frontend origin (production: specific URL)
   - Allow credentials
   - Allow common headers

8. Test suite structure:
   - src/tests/integration/ - API tests
   - src/tests/unit/ - Service tests
   - src/tests/fixtures/ - Test data
   - Run: npm test
   - Coverage: >80%

ROUTES SUMMARY:
Auth:
  POST /api/auth/request-otp
  POST /api/auth/register
  POST /api/auth/login
  POST /api/auth/refresh-token
  POST /api/auth/password-reset-request

Users:
  GET /api/users
  GET /api/users/:id
  PUT /api/users/:id
  POST /api/users/:id/change-password
  POST /api/users/:id/suspend
  POST /api/users/:id/activate
  GET /api/users/search/:query

Clubs:
  POST /api/clubs
  GET /api/clubs
  GET /api/clubs/:id
  PUT /api/clubs/:id
  POST /api/clubs/:id/members
  DELETE /api/clubs/:id/members/:userId
  POST /api/clubs/:id/officers
  GET /api/clubs/:id/hierarchy
  GET /api/clubs/:id/subordinates
  POST /api/clubs/:id/committees
  GET /api/clubs/:id/committees

STANDARDS:
- Consistent request/response format
- All errors use AppError
- All dates ISO 8601
- Pagination: page, pageSize, total, pages
- Status codes: 200, 201, 400, 401, 403, 404, 409, 500
- No sensitive data in logs
- No console.log - use logger

OUTPUT:
Complete, integrated API ready for deployment.
```

---

## WORKFLOW: HOW TO USE THESE PROMPTS

### Step 1: M0.3 Implementation (4-6 hours)
```
1. Open Claude Code
2. Copy PROMPT 1 (M0.3 User Service)
3. Paste into Claude Code chat
4. Claude generates: service, repository, controller, routes, tests
5. Claude gives you file structure and code
6. You copy/paste each file into VSCode in Codespaces
7. Run: npm run test - verify tests pass
8. Commit to GitHub: git commit -am "M0.3: User Service"
```

### Step 2: M0.4 Implementation (6-8 hours)
```
1. After M0.3 tests pass
2. Open Claude Code
3. Copy PROMPT 2 (M0.4 Club Service)
4. Same copy/paste workflow
5. Run tests
6. Commit to GitHub
```

### Step 3: M0.5 Integration (3-4 hours)
```
1. After M0.4 tests pass
2. Open Claude Code
3. Copy PROMPT 3 (M0.5 Routes)
4. Integrate all services
5. Test entire API end-to-end
6. Run: npm run build
7. Commit to GitHub
8. Ready for Phase 1 validation gate
```

---

## VALIDATION GATE 1 CHECKLIST (At end of M0.5)

### Code Quality
- [ ] All TypeScript strict mode ✅
- [ ] No console.log ✅
- [ ] All errors use AppError ✅
- [ ] No TODO/FIXME comments ✅
- [ ] All functions documented ✅

### Testing
- [ ] Unit tests: >80% coverage ✅
- [ ] Integration tests for each endpoint ✅
- [ ] Error cases tested ✅
- [ ] npm run test:coverage passes ✅
- [ ] No failing tests ✅

### Database
- [ ] M0.1 schema migrated ✅
- [ ] All 18 tables created ✅
- [ ] Soft deletes working ✅
- [ ] Indexes optimized ✅

### API
- [ ] All endpoints return correct status codes ✅
- [ ] Request validation working ✅
- [ ] Auth middleware protecting routes ✅
- [ ] CORS configured ✅
- [ ] Health check endpoint ✅

### Documentation
- [ ] README.md complete ✅
- [ ] API endpoints documented ✅
- [ ] Setup instructions clear ✅
- [ ] Error codes documented ✅

### Deployment
- [ ] npm run build succeeds ✅
- [ ] No errors in production mode ✅
- [ ] Environment variables correct ✅
- [ ] Database connection stable ✅
- [ ] Logs structured and readable ✅

### Code Review
- [ ] Architecture reviewed ✅
- [ ] Security review done ✅
- [ ] Performance acceptable ✅
- [ ] PR approved by team ✅

### Sign-Off
- [ ] Backend lead: ✅
- [ ] QA lead: ✅
- [ ] Architect: ✅
- [ ] Product owner: ✅

---

## BEST PRACTICES FOR THIS WORKFLOW

### How to Give Claude Code Context
```
"I'm building M0.3 User Service for Zero Plastic backend.
Here's my existing code:
[Paste: src/services/authService.ts]
[Paste: src/controllers/authController.ts]
[Paste: prisma/schema.prisma]

Now generate UserService following the same pattern.
Use the architecture prompt provided."
```

### How to Handle Large Outputs
```
If Claude Code output is too large:
1. Ask: "Generate UserService and UserRepository only"
2. Then: "Now generate UserController and routes"
3. Then: "Now generate tests"

This keeps outputs manageable and reviewable.
```

### How to Iterate
```
If you want changes:
"The getUserList should support filtering by role. Update the service method and tests."

Claude Code will show the diff and updated code.
```

### Commit Strategy
```
After each module (M0.3, M0.4, M0.5):
git add .
git commit -m "M0.X: [Feature name] - [Brief description]"
git push origin phase-1/backend

This creates a clean history for Phase 1 validation.
```

---

## COMMAND REFERENCE FOR YOUR WORKFLOW

```bash
# Start development
npm run dev

# Run tests (after each module)
npm run test
npm run test:coverage

# Build for production
npm run build

# Migrate database
npx prisma migrate dev

# View database
npx prisma studio

# Format code
npm run format

# Lint code
npm run lint

# Run specific test file
npm run test -- src/tests/unit/userService.test.ts

# Watch mode
npm run test -- --watch
```

---

## EXPECTED TIMELINE

```
M0.3 User Service:      4-6 hours (Tue-Wed)
M0.4 Club Service:      6-8 hours (Wed-Thu)
M0.5 Integration:       3-4 hours (Thu-Fri)
Code review & fixes:    2-3 hours (Fri)
Validation gate sign-off: Done (Fri EOD)

Total Phase 1:          ~20 hours of coding
With breaks/reviews:    Full week
```

---

## NEXT STEP

**You're ready to start M0.3.**

### Immediate action:
1. Open Claude Code
2. Copy PROMPT 1 (M0.3 User Service Implementation)
3. Paste into Claude Code chat
4. Say: "Generate complete UserService, UserRepository, UserController, and routes following this architecture"
5. Claude generates code
6. Copy/paste into VSCode
7. Run: npm run test
8. Commit to GitHub

**Duration: 4-6 hours**

Ready?
```

---

## BONUS: DATABASE ARCHITECTURE PROMPT
### Optional - use for complex queries or optimization

```
PROJECT: Zero Plastic volunteer platform
DATABASE: PostgreSQL with Prisma ORM

TASK: [Specify query complexity]

Current schema: [Paste relevant schema sections]
Current implementation: [Paste existing query]

REQUIREMENTS:
- Performance: Must execute in <50ms
- Include relations: [List what to include]
- Filtering: [Specify filters]
- Sorting: [Specify sort order]
- Pagination: [Specify pagination]

Generate optimized Prisma query that:
1. Uses minimal round trips
2. Selects only needed fields
3. Includes proper indexes
4. Handles soft deletes
5. Returns formatted response

Show:
- Prisma query code
- Performance notes
- Alternative approaches if available
```

---

## YOUR SETUP IS COMPLETE

✅ GitHub Codespaces - coding environment
✅ Claude Code - AI-assisted development
✅ Architecture prompts - clear specifications
✅ Database architecture prompt - for complex queries
✅ Phase 1 implementation ready

**You have everything needed for rapid, high-quality development.**

Start M0.3 when ready.
