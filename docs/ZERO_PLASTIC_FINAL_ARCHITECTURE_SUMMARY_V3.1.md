# Zero Plastic Platform
## Final Architecture Summary v3.1

**Status:** ✅ **ARCHITECTURE FINALIZED - READY TO BUILD**  
**Date:** July 2026  
**Key Decision:** Minimal Mobile App + Comprehensive Web App  

---

## 📊 QUICK OVERVIEW

```
SINGLE BACKEND API (Express.js + PostgreSQL)
        │
        ├─────────────────────────────────────┬─────────────────────────────────────┐
        │                                      │                                     │
        ▼                                      ▼                                     ▼

🎵 MOBILE APP                         🖥️ WEB APPLICATION                  👥 USERS
(Flutter - Volunteer)                 (React - Management)
                                      
Screens: ~12                          Pages: ~40-50
Features: ~30                         Features: ~100+
Size: 50-80 MB                        Size: No limit (web)
Users: Volunteers                     Users: Leaders & Admins
Time: 2-5 min/session                Time: 20-60 min/session
                                      
✅ Check-in/Checkout                 ✅ Create Projects
✅ Discover Projects                 ✅ Approve Projects
✅ Accept/Decline                    ✅ Manage Volunteers
✅ View Badges & Points              ✅ Assign Marks
✅ View Certificates                 ✅ View Reports
✅ Notifications                     ✅ Analytics
❌ Project Creation                  ❌ Check-in/Checkout
❌ Project Approval                  ✅ Team Management
❌ Volunteer Management              ✅ Complaint Handling
❌ Reporting                         ✅ System Admin
```

---

## 🎯 ARCHITECTURE DECISION

### The Question You Asked:
> "What would a volunteer ACTUALLY want on their phone?"

### The Answer:
```
VOLUNTEER NEEDS (on phone):
1. Discover projects nearby ✅
2. Quick yes/no decision ✅
3. GPS check-in/out ✅
4. See badges & points ✅
5. Get notifications ✅

VOLUNTEER DOESN'T NEED (on phone):
1. Create new projects ❌
2. Approve other projects ❌
3. Manage team members ❌
4. View detailed reports ❌
5. Complex workflows ❌
```

### The Decision:
```
MOBILE APP = Volunteer-centric features ONLY
WEB APP = ALL management features
RESULT = Optimal user experience for both roles
```

---

## 📱 MOBILE APP: VOLUNTEER EXPERIENCE

### Purpose
> Enable individual volunteers to participate in Zero Plastic projects

### User Type
```
Individual volunteer (no management role)
├─ Just wants to volunteer
├─ Wants to track their achievement
├─ Wants quick check-in/out
└─ Wants to see badges
```

### 12 Screens

```
1. Splash Screen
   └─ App loading, brand

2. Login Screen
   ├─ Email/phone login
   ├─ Password reset
   └─ Register link

3. Register Screen
   ├─ Phone number input
   ├─ SMS verification
   ├─ Basic profile
   └─ Password setup

4. Home Dashboard
   ├─ Welcome message
   ├─ Quick stats (points, tier)
   ├─ Upcoming projects (1-2)
   └─ Quick action buttons

5. Projects List (Map View)
   ├─ Map of nearby projects
   ├─ Filter by date
   ├─ Filter by distance
   └─ Tap for details

6. Projects List (List View)
   ├─ Projects as list
   ├─ Search projects
   ├─ Sort by date/distance
   └─ Tap for details

7. Project Detail Screen
   ├─ Full project info
   ├─ When/where
   ├─ Volunteer count needed
   ├─ Description
   ├─ ACCEPT button
   └─ DECLINE button

8. Check-In Screen
   ├─ Map showing location
   ├─ GPS accuracy indicator
   ├─ CHECK-IN button
   ├─ Location status
   └─ Confirmation message

9. Check-Out Screen
   ├─ Confirm hours worked
   ├─ Auto-calculated from check-in
   ├─ Editable (if needed)
   ├─ CHECK-OUT button
   └─ Points confirmation

10. Profile Screen
    ├─ Profile picture
    ├─ Name & basic info
    ├─ Total points
    ├─ Current tier badge
    ├─ Total hours
    ├─ Projects count
    ├─ View Certificates button
    └─ Settings button

11. Certificates Screen
    ├─ List of certificates
    ├─ Download button
    ├─ Share button
    └─ Certificate details

12. Settings Screen
    ├─ Edit profile
    ├─ Change password
    ├─ Notification preferences
    ├─ Logout
    └─ About app

+ Notification Center (additional feature)
  ├─ View all notifications
  ├─ Mark as read
  └─ Remove notifications
```

### ~30 Features

```
Authentication:
├─ Register (phone verification)
├─ Login (email/phone)
├─ Password reset
├─ Logout
└─ Biometric login

Discovery:
├─ Find projects near me (map)
├─ List view of projects
├─ Search projects
├─ Filter by date
├─ Filter by distance
└─ Filter by type

Participation:
├─ Accept project (1 tap)
├─ Decline project (1 tap)
├─ View project details
├─ GPS check-in
├─ GPS check-out
├─ Confirm hours
└─ View assigned projects

Achievements:
├─ View total points
├─ View current tier
├─ View tier badge
├─ View tier progression
├─ View projects completed
├─ View total hours volunteered
└─ Share badge on social

Certificates:
├─ View certificates
├─ Download as PDF
├─ Share on WhatsApp
├─ Share on Instagram
└─ Share on Facebook

Notifications:
├─ Push notifications
├─ SMS reminders
├─ WhatsApp alerts
└─ In-app notifications

Profile:
├─ View profile
├─ Edit name
├─ Edit photo
├─ View statistics
└─ Manage preferences

System:
├─ Offline mode (limited)
├─ Local cache
├─ Automatic sync
└─ Settings & preferences
```

### Tech Stack
```
Framework: Flutter 3.22+
Language: Dart 3.3+
State: Riverpod
Database (Local): SQLite
HTTP: Dio
Location: Geolocator + Google Maps
Backend: REST API calls
Auth: JWT tokens
Notifications: Firebase Cloud Messaging
Platforms: iOS 14+, Android 8+
Download Size: 50-80 MB
```

---

## 🖥️ WEB APPLICATION: MANAGEMENT PLATFORM

### Purpose
> Enable club presidents, directors, and admins to manage volunteers and projects

### User Types
```
Volunteer (basic web access)
├─ View own profile
├─ View own achievements
└─ Download certificates

Club President (full management)
├─ Create & manage projects
├─ Manage club volunteers
├─ Assign marks
├─ View club reports
└─ Create team member access

District Director (approval authority)
├─ Approve/reject projects
├─ Manage district-wide volunteers
├─ Handle complaints
└─ View district reports

Provincial Director (higher authority)
├─ Approve projects (2nd level)
├─ Manage provincial data
└─ View provincial reports

National Director (final authority)
├─ Final project approvals
├─ System oversight
├─ National reports
└─ Strategic decisions

System Admin (technical)
├─ User management
├─ System configuration
├─ Integration management
└─ Audit logs
```

### ~40-50 Pages

```
COMMON (All users):
├─ Login page
├─ Dashboard (role-based)
├─ Profile page
├─ Settings page
└─ Logout

VOLUNTEER LEVEL:
├─ My Profile
├─ My Projects
├─ My Certificates
└─ My Statistics

CLUB PRESIDENT LEVEL:
├─ Club Dashboard
├─ Project Creation Form
├─ Project List
├─ Project Detail
├─ Volunteer Directory
├─ Volunteer Detail
├─ Team Member Management
├─ Mark Assignment
├─ Club Reports
├─ Project Submission
├─ Approval Status Tracking
├─ Inventory Management
└─ Equipment Tracking

DISTRICT DIRECTOR LEVEL:
├─ District Dashboard
├─ Club Overview (all clubs)
├─ Project Approval Queue
├─ Project Detail (review)
├─ Approve/Reject Workflow
├─ Volunteer Directory (district-wide)
├─ Volunteer Detail
├─ Complaint Management
├─ Ban Management
├─ Appeal Management
├─ District Reports
├─ Performance Analytics
├─ Comparison Reports
└─ Ban/Blacklist List

PROVINCIAL DIRECTOR LEVEL:
├─ Provincial Dashboard
├─ District Overview
├─ Project Approval (2nd level)
├─ Provincial Reports
├─ Volunteer Statistics
└─ Provincial Analytics

NATIONAL DIRECTOR LEVEL:
├─ National Dashboard
├─ All Data Access
├─ Final Approvals
├─ National Reports
├─ Impact Metrics
├─ Geographic Distribution
└─ Strategic Analytics

SYSTEM ADMIN LEVEL:
├─ User Management
├─ Role Assignment
├─ Permission Management
├─ System Configuration
├─ Integration Setup
├─ Audit Logs
├─ Backup Management
└─ System Health

FEATURE PAGES:
├─ Reports Generator
├─ Leaderboards
├─ Impact Centre
├─ Financial Reports
├─ Complaint Tracking
├─ Automation Workflows
├─ CRM Management
└─ Admin Tools
```

### ~100+ Features

```
Project Management:
├─ Create project
├─ Save as draft
├─ Submit for approval
├─ Edit draft
├─ View approval chain
├─ Add project details
├─ Upload images/documents
├─ Set budget
├─ Assign SDG goals
├─ Select pillars
├─ Add social media links
├─ Complete project
├─ Export project data
└─ Delete project (draft)

Approval Workflows:
├─ View pending projects
├─ Review project details
├─ Request changes
├─ Approve project
├─ Reject project
├─ Add feedback comments
├─ Track approval timeline
├─ See approval chain
├─ Escalate if needed
└─ Send notifications

Volunteer Management:
├─ View volunteer directory
├─ Search volunteers
├─ Filter by tier/club/status
├─ View volunteer profile
├─ View activity history
├─ View project participation
├─ View points breakdown
├─ Edit volunteer info (admin)
├─ Ban volunteer
├─ Lift ban
├─ Handle appeals
├─ Export volunteer lists
└─ Send bulk communications

Mark Management:
├─ View check-in records
├─ Verify attendance
├─ Assign OC roles
├─ Assign OC marks
├─ Apply success adjustment
├─ Export mark reports
├─ Manual mark adjustments
└─ Bulk mark operations

Team Management:
├─ Invite team members
├─ Assign roles
├─ Set permissions
├─ View team members
├─ Remove team members
├─ View activity logs
├─ Manage access levels
└─ Create access tokens

Reporting & Analytics:
├─ Volunteer reports
├─ Project reports
├─ Club reports
├─ District reports
├─ Impact reports
├─ Financial reports
├─ Performance reports
├─ Leaderboards
├─ Geographic distribution
├─ Trend analysis
├─ Comparison reports
├─ Export as PDF
├─ Export as CSV
├─ Export as Excel
└─ Schedule reports

Complaint System:
├─ File complaint
├─ View complaints
├─ Filter complaints
├─ Investigate issues
├─ Request information
├─ Resolve complaint
├─ Document resolution
├─ Handle appeals
├─ Ban after investigation
└─ Appeal management

Inventory Management:
├─ Add inventory items
├─ Edit items
├─ Set stock levels
├─ Track usage
├─ Check-out equipment
├─ Check-in equipment
├─ Record condition
├─ Flag damage
├─ Maintenance scheduling
└─ Depreciation tracking

CRM Management:
├─ Volunteer engagement tracking
├─ Communication history
├─ Email volunteers (bulk)
├─ SMS volunteers (bulk)
├─ Segment lists
├─ Engagement trends
├─ Retention analysis
└─ Partner tracking

Integrations:
├─ Monday.com board view
├─ Make.com automation control
├─ Workflow triggers
├─ Twilio messaging
├─ Email notifications
├─ Slack integration (future)
└─ Webhooks

Administration:
├─ User management
├─ Create users
├─ Assign roles
├─ Manage permissions
├─ Reset passwords
├─ Audit logs
├─ System configuration
├─ Integration settings
├─ Backup management
└─ System health
```

### Tech Stack
```
Framework: React 18+
Build Tool: Vite
Styling: Tailwind CSS
State Management: Zustand / Context API
HTTP Client: Axios
Routing: React Router 6+
Charts: Recharts / Chart.js
Tables: React Data Table / TanStack Table
Forms: React Hook Form
Date Picker: React DatePicker
Backend: REST API calls
Auth: JWT tokens
Database: PostgreSQL (read-only web views)
Hosting: Browser (no download)
Browsers: Chrome, Firefox, Safari, Edge
```

---

## 🔌 SHARED BACKEND API

### Single Express.js Backend

```
Database: PostgreSQL 18.4
ORM: Prisma
Language: Node.js 22 LTS + TypeScript
Framework: Express.js
Port: 8080 (internal) / HTTPS (external)
```

### API Endpoints (Both Apps Use)

```
AUTHENTICATION:
POST   /api/auth/register              Mobile + Web
POST   /api/auth/login                 Mobile + Web
POST   /api/auth/logout                Mobile + Web
POST   /api/auth/refresh               Mobile + Web
POST   /api/auth/password-reset        Mobile + Web
POST   /api/auth/verify-phone          Mobile

VOLUNTEERS:
GET    /api/volunteers                 Web (list view)
GET    /api/volunteers/:id             Mobile + Web
PUT    /api/volunteers/:id             Web (edit)
GET    /api/volunteers/me              Mobile (own profile)
GET    /api/volunteers/leaderboard     Mobile + Web
POST   /api/volunteers/:id/ban         Web (admin)

PROJECTS:
GET    /api/projects                   Mobile (discovery) + Web (management)
GET    /api/projects/:id               Mobile + Web
POST   /api/projects                   Web (create only)
PUT    /api/projects/:id               Web (edit only)
POST   /api/projects/:id/submit        Web (submit for approval)
POST   /api/projects/:id/approve       Web (approval workflow)
POST   /api/projects/:id/reject        Web (rejection)
POST   /api/projects/:id/complete      Web (mark complete)

CHECK-IN/OUT:
POST   /api/checkin                    Mobile (primary)
POST   /api/checkout                   Mobile (primary)
GET    /api/checkin/:id                Web (view records)
GET    /api/checkin/project/:id        Web (view project attendance)

MARKS & POINTS:
GET    /api/marks/project/:id          Web (view marks)
POST   /api/marks/assign               Web (assign OC marks)
POST   /api/marks/adjustment           Web (success adjustment)

REPORTING:
GET    /api/reports/volunteer/:id      Web (performance)
GET    /api/reports/project/:id        Web (impact)
GET    /api/reports/club/:id           Web (club performance)
GET    /api/reports/district/:id       Web (district performance)
GET    /api/reports/national           Web (national dashboard)
GET    /api/reports/impact             Web (environmental metrics)

CERTIFICATES:
GET    /api/certificates               Mobile + Web
POST   /api/certificates/generate      Web (generate)
GET    /api/certificates/:id/download  Mobile + Web

COMPLAINTS:
POST   /api/complaints                 Web (file)
GET    /api/complaints                 Web (view - admin)
PUT    /api/complaints/:id             Web (resolve)

OTHERS:
GET    /api/inventory                  Web
POST   /api/inventory                  Web
GET    /api/employees                  Web
POST   /api/approvals                  Web (approval workflow)
```

---

## 🚀 IMPLEMENTATION TIMELINE

### Phase 1: Backend Setup (Weeks 1-2)
```
✅ Database schema (Prisma)
✅ Authentication system (JWT)
✅ Core repositories
✅ Basic services
✅ Error handling
✅ Logging setup
Result: API ready for mobile & web
```

### Phase 2: Mobile App (Weeks 3-8)
```
Week 3-4:
├─ Auth screens (register, login)
├─ Home dashboard
└─ Project discovery

Week 5-6:
├─ Check-in/out with GPS
├─ Profile & achievements
├─ Certificates
└─ Notifications

Result: MOBILE APP COMPLETE
Volunteers can discover projects & check-in
```

### Phase 3: Web App Core (Weeks 9-14)
```
Week 9-10:
├─ Auth & login
├─ Club dashboard
├─ Project creation
└─ Basic project list

Week 11-12:
├─ Approval workflows
├─ Volunteer management
├─ Mark assignment
└─ Club reports

Week 13-14:
├─ District director views
├─ Complaint management
└─ Ban management

Result: WEB APP MVP COMPLETE
Club presidents can manage projects
```

### Phase 4: Web App Advanced (Weeks 15-20)
```
Week 15-16:
├─ Advanced reporting
├─ Analytics dashboards
└─ CRM functions

Week 17-18:
├─ Team access control
├─ Inventory management
└─ Financial reports

Week 19-20:
├─ Admin functions
├─ System configuration
└─ Integration management

Result: FULL WEB APP COMPLETE
Complete management platform
```

---

## 📊 FEATURE ALLOCATION

### Mobile App
```
Total Screens: 12
Total Features: ~30
Download Size: 50-80 MB
Users: Individual volunteers
Time per session: 2-5 minutes
Complexity: Simple & focused
Purpose: Volunteer participation
```

### Web App
```
Total Pages: 40-50
Total Features: ~100+
No download (browser-based)
Users: Leaders, directors, admins
Time per session: 20-60 minutes
Complexity: Comprehensive
Purpose: Project management
```

### Backend API
```
Endpoints: ~50-60
Methods: GET, POST, PUT, DELETE
Database: PostgreSQL 18.4
ORM: Prisma
Auth: JWT
Users: Both apps
Purpose: Data persistence & logic
```

---

## ✅ ARCHITECTURE CHECKLIST

### Mobile App
- [x] Volunteer-centric (minimal)
- [x] Fast load (<3 seconds)
- [x] GPS check-in/out
- [x] Achievement tracking
- [x] Certificate management
- [x] Notification system
- [x] Offline support (limited)
- [x] iOS 14+ & Android 8+

### Web App
- [x] Management-focused (comprehensive)
- [x] Project creation & approval
- [x] Volunteer management
- [x] Reporting & analytics
- [x] Team access control
- [x] Complaint handling
- [x] CRM functions
- [x] Admin capabilities

### Backend
- [x] Express.js setup
- [x] PostgreSQL connected
- [x] Prisma ORM
- [x] JWT authentication
- [x] Error handling
- [x] Logging setup
- [x] API documentation
- [x] CI/CD ready

### Infrastructure
- [x] Azure App Service
- [x] Azure PostgreSQL
- [x] GitHub Actions
- [x] Automated deployment
- [x] Health monitoring
- [x] Backup configured
- [x] SSL/TLS enabled

---

## 🎯 PHILOSOPHY

```
MOBILE: "What does a volunteer need on their phone to participate?"
ANSWER: "Check-in, see badges, get notified. That's it. Fast and simple."

WEB: "What does a leader need to manage volunteers and projects?"
ANSWER: "Everything. Projects, approvals, reports, team, complaints. Comprehensive."

RESULT: Two optimal tools for two different jobs.
```

---

## 📁 COMPLETE DOCUMENTATION SET

You now have in `/outputs/`:

1. **ZERO_PLASTIC_SRS_V2_UPDATED.md**
   - All business requirements (14 major features)
   - Workflows and processes
   - Data models
   - User roles

2. **ZERO_PLASTIC_TECHNICAL_ARCHITECTURE_V2.md**
   - Complete system design
   - API specifications
   - Implementation patterns
   - Code examples

3. **ZERO_PLASTIC_LIVE_STATUS_UPDATE.md**
   - Infrastructure status
   - Current state
   - Next phases
   - Development workflow

4. **ZERO_PLASTIC_UPDATED_REQUIREMENTS_V3_WEB_VS_MOBILE.md**
   - Detailed feature allocation
   - Web vs Mobile breakdown
   - User journeys
   - Feature matrix

5. **ZERO_PLASTIC_VOLUNTEER_PERSPECTIVE_APP_STRATEGY.md** (THIS)
   - Volunteer-centric approach
   - Real-world scenarios
   - Decision trees
   - Implementation priority

---

## 🎉 STATUS

```
✅ INFRASTRUCTURE:        Live & Running
✅ DATABASE:             Connected & Healthy
✅ BACKEND API:          Ready for features
✅ ARCHITECTURE:         Finalized
✅ DOCUMENTATION:        Complete
✅ TEAM ORGANIZATION:    Clear roles
✅ TIMELINE:             Realistic (4-5 months)
✅ TECHNOLOGY:           Modern & proven
✅ DEPLOYMENT:           Automated
```

---

**READY TO START DEVELOPMENT**

**Next Step:** Begin Phase 1 (Backend + Mobile Auth)

**Questions?** Refer to the 5 documentation files above.

