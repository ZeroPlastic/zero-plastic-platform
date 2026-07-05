# ENHANCED PRISMA SCHEMA
## Enterprise-Grade Zero Plastic Platform
## Version 2.0 - With Club Hierarchy, Types, Events, Meetings, Assets, Finances

Replace your current `prisma/schema.prisma` with this complete schema.

---

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum ClubType {
  NATIONAL          // Top level - oversees all
  PROVINCIAL        // State/province level - oversees districts
  DISTRICT          // District level - oversees institutions
  UNIVERSITY        // University club
  SCHOOL            // School club
  INSTITUTIONAL     // Institutional club
  COMMUNITY         // Community club
}

enum UserRole {
  VOLUNTEER
  CLUB_MEMBER       // Regular member of club
  CLUB_OFFICER      // Officer role (president, secretary, treasurer, etc)
  CLUB_COMMITTEE    // Committee member
  DISTRICT_DIRECTOR
  PROVINCIAL_DIRECTOR
  NATIONAL_DIRECTOR
  FINANCE_MANAGER
  HR_MANAGER
  SYSTEM_ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  BANNED
  SUSPENDED
}

enum ProjectStatus {
  DRAFT
  SUBMITTED
  APPROVED
  ACTIVE
  COMPLETED
  REJECTED
  CANCELLED
}

enum ProjectVolunteerStatus {
  INVITED
  ACCEPTED
  DECLINED
  ATTENDED
  NO_SHOW
}

enum ComplaintStatus {
  OPEN
  INVESTIGATING
  RESOLVED
  DISMISSED
  APPEALED
}

enum AssetStatus {
  AVAILABLE
  IN_USE
  MAINTENANCE
  RETIRED
}

enum MeetingType {
  GENERAL_MEETING
  COMMITTEE_MEETING
  PLANNING_SESSION
  REVIEW_MEETING
  EMERGENCY_MEETING
}

enum EventType {
  MEETING
  TRAINING
  CELEBRATION
  FUNDRAISER
  COMMUNITY_EVENT
  OTHER
}

// ============================================
// USERS & AUTHENTICATION
// ============================================

model User {
  id                String    @id @default(uuid())
  email             String    @unique
  phone             String    @unique
  passwordHash      String
  
  // User info
  role              UserRole  @default(VOLUNTEER)
  status            UserStatus @default(ACTIVE)
  
  // Relations
  profile           Profile?
  
  // Club leadership
  leadingClubs      Club[]    @relation("clubPresident")
  clubMemberships   ClubMember[]
  committeeRoles    ClubCommitteeMember[]
  
  // Activities
  projectParticipation ProjectVolunteer[]
  checkIns          CheckIn[]
  marks             Mark[]
  complaints        Complaint[]
  filedComplaints   Complaint[] @relation("filedBy")
  events            Event[]   @relation("eventCreatedBy")
  meetings          Meeting[] @relation("meetingCreatedBy")
  
  // Soft delete
  deletedAt         DateTime?
  
  // Audit
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Indexes
  @@index([email])
  @@index([phone])
  @@index([role])
  @@index([status])
  @@index([deletedAt])
}

model Profile {
  id                String    @id @default(uuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Personal info
  firstName         String
  lastName          String
  profileImageUrl   String?
  bio               String?
  dateOfBirth       DateTime?
  gender            String?
  
  // Verification
  phoneVerified     Boolean   @default(false)
  emailVerified     Boolean   @default(false)
  
  // Achievement tracking
  totalPoints       Int       @default(0)
  totalHours        Float     @default(0.0)
  tier              String    @default("ROOKIE")  // ROOKIE, HELPER, LEADER, SUPERHERO, CHAMPION
  projectsCompleted Int       @default(0)
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([userId])
  @@index([deletedAt])
}

// ============================================
// CLUBS & ORGANIZATION (WITH HIERARCHY)
// ============================================

model Club {
  id                String    @id @default(uuid())
  name              String    @unique
  type              ClubType
  description       String?
  logoUrl           String?
  
  // Leadership
  presidentId       String    @unique
  president         User      @relation("clubPresident", fields: [presidentId], references: [id], onDelete: Restrict)
  
  // Club Hierarchy (for DISTRICT and PROVINCIAL clubs)
  parentClubId      String?                          // Parent club (if this is subordinate)
  parentClub        Club?     @relation("clubHierarchy", fields: [parentClubId], references: [id], onDelete: SetNull)
  childClubs        Club[]    @relation("clubHierarchy")  // Subordinate clubs
  
  // Location
  location          String?
  city              String?
  district          String?
  province          String?
  country           String    @default("Sri Lanka")
  latitude          Float?
  longitude         Float?
  
  // Contact
  email             String?
  phone             String?
  website           String?
  
  // Relations
  members           ClubMember[]
  committees        ClubCommittee[]
  projects          Project[]
  events            Event[]
  meetings          Meeting[]
  assets            Asset[]
  finances          Finance[]
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Indexes
  @@index([type])
  @@index([presidentId])
  @@index([parentClubId])
  @@index([district])
  @@index([city])
  @@index([province])
  @@index([deletedAt])
}

model ClubMember {
  id                String    @id @default(uuid())
  
  // Relations
  clubId            String
  club              Club      @relation(fields: [clubId], references: [id], onDelete: Cascade)
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Membership details
  membershipStatus  String    @default("ACTIVE")  // ACTIVE, INACTIVE, SUSPENDED
  joinedAt          DateTime  @default(now())
  leftAt            DateTime?
  
  // Officer role (if applicable)
  isOfficer         Boolean   @default(false)
  officerRole       String?   // PRESIDENT, VICE_PRESIDENT, SECRETARY, TREASURER, etc
  
  // Permissions
  canCreateProjects Boolean   @default(false)
  canApproveProjects Boolean  @default(false)
  canManageMembers  Boolean   @default(false)
  canManageFinances Boolean   @default(false)
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Indexes & Constraints
  @@unique([clubId, userId], name: "unique_club_member")
  @@index([clubId])
  @@index([userId])
  @@index([membershipStatus])
  @@index([deletedAt])
}

// ============================================
// COMMITTEES
// ============================================

model ClubCommittee {
  id                String    @id @default(uuid())
  
  // Ownership
  clubId            String
  club              Club      @relation(fields: [clubId], references: [id], onDelete: Cascade)
  
  // Committee details
  name              String                          // Finance Committee, HR Committee, etc
  description       String?
  chairpersonId     String
  chairperson       ClubCommitteeMember @relation("chairperson", fields: [chairpersonId], references: [id], onDelete: Restrict)
  
  // Members of this committee
  members           ClubCommitteeMember[]
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([clubId, name], name: "unique_club_committee")
  @@index([clubId])
  @@index([chairpersonId])
  @@index([deletedAt])
}

model ClubCommitteeMember {
  id                String    @id @default(uuid())
  
  // Relations
  committeeId       String
  committee         ClubCommittee @relation(fields: [committeeId], references: [id], onDelete: Cascade)
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Committee membership
  role              String?   // Member, Vice Chair, etc
  joinedAt          DateTime  @default(now())
  leftAt            DateTime?
  
  // Self-relation for chairperson
  chairpersonOf     ClubCommittee[] @relation("chairperson")
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([committeeId, userId], name: "unique_committee_member")
  @@index([committeeId])
  @@index([userId])
  @@index([deletedAt])
}

// ============================================
// PROJECTS
// ============================================

model Project {
  id                String    @id @default(uuid())
  
  // Ownership
  clubId            String
  club              Club      @relation(fields: [clubId], references: [id], onDelete: Cascade)
  
  // Basic info
  name              String
  description       String?
  type              String?   // CLEANUP, EDUCATION, COMMUNITY, etc
  
  // Status
  status            ProjectStatus @default(DRAFT)
  
  // Scheduling
  startDate         DateTime
  endDate           DateTime
  startTime         String?   // HH:mm format
  endTime           String?
  
  // Location
  location          String
  latitude          Float?
  longitude         Float?
  
  // Volunteer info
  volunteersNeeded  Int
  volunteers        ProjectVolunteer[]
  
  // Impact & Budget
  budget            Float?
  impactMetrics     String?   // JSON: {plasticCollected, areasCleared, etc}
  
  // Approval workflow
  submittedAt       DateTime?
  approvedAt        DateTime?
  approvedBy        String?   // User ID of approver
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Indexes
  @@index([clubId])
  @@index([status])
  @@index([startDate])
  @@index([deletedAt])
}

model ProjectVolunteer {
  id                String    @id @default(uuid())
  
  // Relations
  projectId         String
  project           Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Participation
  status            ProjectVolunteerStatus @default(INVITED)
  hoursWorked       Float     @default(0.0)
  
  // Timestamps
  invitedAt         DateTime  @default(now())
  respondedAt       DateTime?
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([projectId, userId], name: "unique_project_volunteer")
  @@index([projectId])
  @@index([userId])
  @@index([status])
  @@index([deletedAt])
}

// ============================================
// EVENTS & MEETINGS
// ============================================

model Event {
  id                String    @id @default(uuid())
  
  // Ownership
  clubId            String
  club              Club      @relation(fields: [clubId], references: [id], onDelete: Cascade)
  createdById       String
  createdBy         User      @relation("eventCreatedBy", fields: [createdById], references: [id], onDelete: Restrict)
  
  // Event details
  name              String
  description       String?
  type              EventType
  
  // Scheduling
  startDate         DateTime
  endDate           DateTime
  startTime         String?   // HH:mm format
  endTime           String?
  
  // Location
  location          String?
  latitude          Float?
  longitude         Float?
  
  // Capacity
  maxAttendees      Int?
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([clubId])
  @@index([createdById])
  @@index([type])
  @@index([startDate])
  @@index([deletedAt])
}

model Meeting {
  id                String    @id @default(uuid())
  
  // Ownership
  clubId            String
  club              Club      @relation(fields: [clubId], references: [id], onDelete: Cascade)
  createdById       String
  createdBy         User      @relation("meetingCreatedBy", fields: [createdById], references: [id], onDelete: Restrict)
  
  // Meeting details
  title             String
  description       String?
  type              MeetingType
  
  // Scheduling
  scheduledDate     DateTime
  startTime         String    // HH:mm format
  endTime           String    // HH:mm format
  
  // Location
  location          String?
  
  // Meeting notes
  minutes           String?   // Meeting minutes/notes
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([clubId])
  @@index([createdById])
  @@index([type])
  @@index([scheduledDate])
  @@index([deletedAt])
}

// ============================================
// ASSETS & INVENTORY
// ============================================

model Asset {
  id                String    @id @default(uuid())
  
  // Ownership
  clubId            String
  club              Club      @relation(fields: [clubId], references: [id], onDelete: Cascade)
  
  // Asset details
  name              String
  description       String?
  type              String    // Equipment, Vehicle, Facility, etc
  serialNumber      String?
  value             Float?    // Asset value in currency
  
  // Status
  status            AssetStatus @default(AVAILABLE)
  location          String?
  
  // Maintenance
  lastMaintenanceDate DateTime?
  nextMaintenanceDate DateTime?
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([clubId])
  @@index([status])
  @@index([type])
  @@index([deletedAt])
}

// ============================================
// FINANCES
// ============================================

model Finance {
  id                String    @id @default(uuid())
  
  // Ownership
  clubId            String
  club              Club      @relation(fields: [clubId], references: [id], onDelete: Cascade)
  
  // Transaction details
  type              String    // INCOME, EXPENSE, TRANSFER
  category          String    // Donation, Project_Fund, Equipment, Salary, etc
  description       String
  
  // Amount
  amount            Float
  currency          String    @default("LKR")  // Sri Lankan Rupees
  
  // Date
  transactionDate   DateTime
  
  // Status
  status            String    @default("PENDING")  // PENDING, APPROVED, REJECTED
  approvedBy        String?   // User ID of approver
  approvedDate      DateTime?
  
  // Reference
  projectId         String?
  eventId           String?
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([clubId])
  @@index([type])
  @@index([category])
  @@index([transactionDate])
  @@index([status])
  @@index([deletedAt])
}

// ============================================
// CHECK-IN / CHECK-OUT (ATTENDANCE)
// ============================================

model CheckIn {
  id                String    @id @default(uuid())
  
  // Relations
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId         String
  
  // Check-in details
  checkInTime       DateTime
  checkOutTime      DateTime?
  
  // Location verification
  latitude          Float
  longitude         Float
  accuracy          Float?
  
  // Points earned
  pointsEarned      Int       @default(0)
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([userId])
  @@index([projectId])
  @@index([checkInTime])
  @@index([deletedAt])
}

// ============================================
// MARKS & POINTS
// ============================================

model Mark {
  id                String    @id @default(uuid())
  
  // Relations
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId         String
  
  // Marks (OC = Organizer Contribution)
  ocMark            Int?      // 0-10, null if not assigned
  successAdjustment Int       @default(0)
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([userId, projectId], name: "unique_user_project_mark")
  @@index([userId])
  @@index([projectId])
  @@index([deletedAt])
}

// ============================================
// CERTIFICATES
// ============================================

model Certificate {
  id                String    @id @default(uuid())
  
  // Relations
  userId            String
  projectId         String
  
  // Certificate details
  certificateUrl    String
  qrCode            String?
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([userId])
  @@index([projectId])
  @@index([deletedAt])
}

// ============================================
// COMPLAINTS & DISPUTES
// ============================================

model Complaint {
  id                String    @id @default(uuid())
  
  // Who filed
  filedByUserId     String
  filedByUser       User      @relation("filedBy", fields: [filedByUserId], references: [id], onDelete: Cascade)
  
  // Complaint details
  description       String
  status            ComplaintStatus @default(OPEN)
  resolution        String?
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([filedByUserId])
  @@index([status])
  @@index([deletedAt])
}

// ============================================
// AUDIT LOG
// ============================================

model AuditLog {
  id                String    @id @default(uuid())
  
  // Who did the action
  userId            String?
  
  // What action
  action            String    // CREATE, UPDATE, DELETE, LOGIN, etc
  entity            String    // User, Club, Project, etc
  entityId          String    // Which record
  
  // What changed (JSON)
  oldValues         String?
  newValues         String?
  
  // Timestamp
  createdAt         DateTime  @default(now())
  
  @@index([userId])
  @@index([action])
  @@index([entity])
  @@index([createdAt])
}

// ============================================
// NOTIFICATIONS
// ============================================

model Notification {
  id                String    @id @default(uuid())
  
  // Who receives
  userId            String
  
  // Notification content
  type              String    // PROJECT_REMINDER, TIER_PROMOTION, MEETING_INVITE, etc
  title             String
  message           String
  
  // Status
  isRead            Boolean   @default(false)
  
  // Soft delete & audit
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  readAt            DateTime?
  
  @@index([userId])
  @@index([type])
  @@index([isRead])
  @@index([createdAt])
  @@index([deletedAt])
}

---

## MIGRATION STEPS

### 1. Replace schema.prisma
```bash
# Copy entire schema above into prisma/schema.prisma
```

### 2. Generate new migration
```bash
npx prisma migrate dev --name add_club_types_hierarchy_events_meetings_assets_finances
```

### 3. Verify tables created
```bash
npx prisma studio

# You should see all these tables:
✅ User
✅ Profile
✅ Club
✅ ClubMember
✅ ClubCommittee
✅ ClubCommitteeMember
✅ Project
✅ ProjectVolunteer
✅ Event
✅ Meeting
✅ Asset
✅ Finance
✅ CheckIn
✅ Mark
✅ Certificate
✅ Complaint
✅ AuditLog
✅ Notification
```

---

## KEY IMPROVEMENTS IN THIS SCHEMA

✅ **Club Hierarchy**
- `parentClubId` allows NATIONAL → PROVINCIAL → DISTRICT → INSTITUTIONAL structure
- District and Provincial clubs can supervise subordinate clubs

✅ **Club Types**
- Enum with 7 types: NATIONAL, PROVINCIAL, DISTRICT, UNIVERSITY, SCHOOL, INSTITUTIONAL, COMMUNITY

✅ **Committees**
- `ClubCommittee` model for committees (Finance, HR, Planning, etc)
- `ClubCommitteeMember` for committee membership
- Chairperson relationship built-in

✅ **Events & Meetings**
- `Event` for large events (celebrations, fundraisers, training)
- `Meeting` for internal meetings (general, committee, planning)

✅ **Asset Management**
- `Asset` model for equipment, vehicles, facilities
- Status tracking (AVAILABLE, IN_USE, MAINTENANCE, RETIRED)

✅ **Financial Management**
- `Finance` model for income, expenses, transfers
- Category-based tracking
- Approval workflow

✅ **Enterprise Features**
- UUID IDs (not CUID) - industry standard
- Soft deletes (`deletedAt`) on all entities
- Audit fields (`createdAt`, `updatedAt`) on all entities
- Comprehensive indexes for performance
- Normalized relational design

✅ **Club Capabilities Covered**
- Have members ✅ (ClubMember)
- Have committee members ✅ (ClubCommitteeMember)
- Run projects ✅ (Project)
- Run events ✅ (Event)
- Manage volunteers ✅ (ProjectVolunteer, CheckIn)
- Manage assets ✅ (Asset)
- Manage finances ✅ (Finance)
- Manage meetings ✅ (Meeting)

✅ **Role-Based Permissions**
- `ClubMember` has permission flags:
  - `canCreateProjects`
  - `canApproveProjects`
  - `canManageMembers`
  - `canManageFinances`

---

## DATABASE DIAGRAM (Text Format)

```
USERS & CLUBS:
User (1) ──→ (many) ClubMember ──→ (1) Club
User (1) ──→ (many) Profile
Club (1) ──→ (1) Club (parentClub - hierarchy)
Club (1) ──→ (many) Club (childClubs - hierarchy)

COMMITTEES:
Club (1) ──→ (many) ClubCommittee ──→ (many) ClubCommitteeMember ──→ (1) User

OPERATIONS:
Club (1) ──→ (many) Project (1) ──→ (many) ProjectVolunteer ──→ (1) User
Club (1) ──→ (many) Event ──→ created by User
Club (1) ──→ (many) Meeting ──→ created by User
Club (1) ──→ (many) Asset
Club (1) ──→ (many) Finance

VOLUNTEERS:
User (1) ──→ (many) CheckIn ──→ Project
User (1) ──→ (many) Mark ──→ Project
User (1) ──→ (many) Certificate

GOVERNANCE:
User (1) ──→ (many) Complaint
User (1) ──→ (many) AuditLog
User (1) ──→ (many) Notification
```

---

## NEXT STEPS

After migration:
1. ✅ M0.1: Database schema (COMPLETE)
2. ✅ M0.2: Authentication (COMPLETE)
3. ⏳ M0.3: User Service (list, get, update)
4. ⏳ M0.4: Club Service (create, list, manage hierarchy)
5. ⏳ M0.5: API Routes (connect all)

**Ready for M0.3 implementation?**
