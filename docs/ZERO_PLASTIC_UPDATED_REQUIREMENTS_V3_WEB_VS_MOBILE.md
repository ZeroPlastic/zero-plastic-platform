# Zero Plastic Platform
## Updated Requirements Specification - Mobile App vs Web Application Division

**Version:** 3.0 (Architecture Clarification)  
**Date:** July 2026  
**Status:** Ready for Implementation  
**Key Update:** Clear separation between Volunteer Mobile App (minimal) and Web-Based Management Application (comprehensive)  

---

## TABLE OF CONTENTS

1. [Architecture Overview](#1-architecture-overview)
2. [Application Division](#2-application-division)
3. [Mobile App Requirements](#3-mobile-app-requirements)
4. [Web Application Requirements](#4-web-application-requirements)
5. [Shared Backend API](#5-shared-backend-api)
6. [User Journeys](#6-user-journeys)
7. [Feature Matrix](#7-feature-matrix)

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 New Application Architecture

```
Single Backend API (Express.js + PostgreSQL)
    │
    ├─ Mobile App (Flutter)          [Volunteer-focused - MINIMAL]
    │   └─ Check-in/out, badges, accept/reject, notifications
    │
    └─ Web Application (React)       [Management-focused - COMPREHENSIVE]
        ├─ Club/Chapter management
        ├─ Project management & approval workflows
        ├─ Volunteer management
        ├─ Team/leader management
        ├─ Analytics & reporting
        ├─ Financial management
        ├─ Inventory management
        ├─ CRM
        └─ All administrative functions
```

### 1.2 Core Philosophy

```
MOBILE APP (Volunteer Experience):
- Purpose: Enable volunteers to participate in projects
- Focus: Simple, fast, essential features only
- Motto: "What would a volunteer NEED on their phone?"

WEB APPLICATION (Management Experience):
- Purpose: Enable leadership to manage volunteers and projects
- Focus: Comprehensive, detailed, administrative features
- Motto: "What do chapter leaders need to run activities?"

RULE: If it's management/administrative → Web App
      If it's volunteer participation → Mobile App (if essential) or Web App
```

---

## 2. APPLICATION DIVISION

### 2.1 WHO USES WHAT?

#### Mobile App (Volunteer App)
```
Users:
├─ Individual Volunteers
└─ General volunteers (not in management roles)

Access Level:
├─ Own profile only
├─ Can view assigned projects
├─ Can see own badges/achievements
└─ Limited to personal activities
```

#### Web Application
```
Users:
├─ Club Presidents
├─ Club Officers/Leaders
├─ District Directors
├─ Provincial Directors
├─ National Directors
├─ System Admins
├─ HR Managers
├─ Finance Team
└─ (Anyone in a management/administrative role)

Access Level:
├─ Full club/chapter management
├─ Multiple volunteers management
├─ Project oversight
├─ Financial management
├─ Reporting & analytics
├─ Team member management
└─ System configuration
```

### 2.2 Decision Tree

```
USER QUESTION: What do I need to access?

├─ "I want to check-in to a project"
│   └─ USE: Mobile App (essential volunteer feature)
│
├─ "I want to see my badges and points"
│   └─ USE: Mobile App (personal achievement tracking)
│
├─ "I want to accept a project invitation"
│   └─ USE: Mobile App (simple yes/no action)
│
├─ "I need to create a new project"
│   └─ USE: Web App (complex form, multiple fields)
│
├─ "I need to approve a project"
│   └─ USE: Web App (multi-step workflow)
│
├─ "I need to manage club volunteers"
│   └─ USE: Web App (comprehensive list, admin actions)
│
├─ "I need to see reports and analytics"
│   └─ USE: Web App (detailed dashboards)
│
└─ "I need to manage team members and their access"
    └─ USE: Web App (administrative functions)
```

---

## 3. MOBILE APP REQUIREMENTS

### 3.1 Mobile App Vision

**Name:** Zero Plastic Volunteer  
**Platform:** iOS 14+, Android 8+  
**Framework:** Flutter  
**Philosophy:** **MINIMUM VIABLE** - Only features a volunteer needs in their pocket

### 3.2 Mobile App Features

#### Authentication (Essential)
```
FR-M1: Volunteer Registration via Mobile
├─ Phone number + SMS verification (Twilio)
├─ Quick profile setup (name, club selection)
├─ Password setup
├─ One-time setup (then login only)
└─ Purpose: Get volunteer into the system

FR-M2: Login/Logout
├─ Email or phone login
├─ Biometric support (fingerprint)
├─ Session management
└─ Purpose: Secure access

FR-M3: Password Reset
├─ SMS-based reset link
├─ Email-based reset link
└─ Purpose: Account recovery
```

#### Project Participation (Core Feature)
```
FR-M4: Discover Available Projects
├─ List projects near volunteer's location
├─ Filter by date
├─ Filter by type (cleanup, education, etc.)
├─ Search by name
├─ Show: project name, date, time, location, volunteer count needed
└─ Purpose: Find projects to join

FR-M5: Accept/Reject Project Invitation
├─ See project details
├─ One-click accept
├─ One-click decline with reason
├─ Confirmation message
└─ Purpose: Quick project commitment

FR-M6: Check-In to Project
├─ GPS location verification (100m geofence)
├─ One-tap check-in
├─ Real-time location check
├─ Timestamp recorded
├─ Visual confirmation
└─ Purpose: Record attendance

FR-M7: Check-Out from Project
├─ Confirm hours worked
├─ GPS verification
├─ Timestamp recorded
├─ Automatic marks calculation
└─ Purpose: Record attendance completion
```

#### Personal Achievement (Motivational)
```
FR-M8: View Profile
├─ Photo
├─ Name & contact
├─ Total points
├─ Current tier with badge
├─ Total hours volunteered
├─ Projects completed
└─ Purpose: Personal dashboard

FR-M9: View Badges & Achievements
├─ Current tier badge display
├─ Milestone achievements
├─ Project certificates
├─ Timeline of achievements
├─ Share achievements (social media)
└─ Purpose: Recognition & motivation

FR-M10: View Points & Leaderboard
├─ Personal points total
├─ Tier progression (0-1000-2000 etc.)
├─ Top 10 volunteers (optional)
├─ Monthly points earned
└─ Purpose: Track progress

FR-M11: View Certificates
├─ List of earned certificates
├─ Download as PDF
├─ Share certificate
├─ QR code verification
└─ Purpose: Proof of participation
```

#### Notifications & Updates (Engagement)
```
FR-M12: Push Notifications
├─ Project reminder (24 hours before)
├─ Project reminder (2 hours before)
├─ Tier promotion celebration
├─ Project created near you
├─ Approval notifications
└─ Opt-in/out per notification type

FR-M13: Activity Feed (Optional)
├─ See other volunteers' tier promotions
├─ See projects in progress
├─ See impact milestones
├─ Very lightweight (no long posts)
└─ Purpose: Community connection
```

#### Account Settings (Support)
```
FR-M14: Edit Profile (Basic)
├─ Update phone number
├─ Update name
├─ Update profile picture
├─ Update bio
└─ Purpose: Profile management

FR-M15: Notification Preferences
├─ Turn on/off notification types
├─ Set quiet hours
└─ Purpose: Control noise

FR-M16: Logout
├─ Clear session
├─ Remove local cache (offline data)
└─ Purpose: Security
```

### 3.3 Mobile App Architecture

```
Volunteer App Structure:

Pages:
├─ Login/Register
├─ Home Dashboard
│   ├─ Projects near me (map + list)
│   ├─ Quick stats (points, tier, projects)
│   └─ Upcoming projects
├─ Project Detail
│   ├─ Full project info
│   └─ Accept/Reject buttons
├─ Check-In Screen
│   ├─ GPS map
│   ├─ Check-in button
│   └─ Status confirmation
├─ Profile
│   ├─ Personal stats
│   ├─ Badges/tier
│   ├─ Certificates
│   └─ Edit button
├─ Notifications
│   └─ All notifications list
└─ Settings
    ├─ Edit profile
    ├─ Change password
    ├─ Notification preferences
    └─ Logout

Data Stored (Local):
├─ JWT token (encrypted)
├─ User profile (cached)
├─ Recent projects (cached)
├─ Offline mode: last project for check-in

Sync with Backend:
├─ Check-in/out events (real-time)
├─ Accept/reject actions (real-time)
├─ Get fresh projects list
├─ Get notifications
```

### 3.4 Mobile App - What's NOT Included

```
❌ NOT in Mobile App:
├─ Project creation
├─ Project approval workflows
├─ Volunteer management (viewing other volunteers' details)
├─ Financial reporting
├─ Inventory management
├─ Project scoring
├─ Impact analysis
├─ Detailed analytics
├─ Employee management
├─ CRM functions
├─ Team management
└─ Administrative functions

Why NOT?
→ These require:
   ├─ Significant data entry
   ├─ Complex workflows
   ├─ Large data tables
   ├─ Multiple permissions
   └─ Better suited for desktop/web

→ Mobile apps should be:
   ├─ Light & fast
   ├─ Single-purpose
   ├─ Quick actions only
   └─ Minimal typing
```

---

## 4. WEB APPLICATION REQUIREMENTS

### 4.1 Web Application Vision

**Name:** Zero Plastic Management Platform  
**Platform:** Web (Chrome, Firefox, Safari, Edge)  
**Framework:** React + Vite + Tailwind CSS  
**Philosophy:** **COMPREHENSIVE MANAGEMENT** - Everything needed to run volunteer programs

### 4.2 Web Application Features

#### Club/Chapter Management
```
FR-W1: Club Profiles
├─ Club information
├─ Club officers assignment
├─ Contact details
├─ Historical data by year
└─ Edit club settings

FR-W2: Club Member Management
├─ Add new members
├─ Remove members
├─ View all volunteers in club
├─ Search volunteers
├─ View volunteer details
├─ Assign roles
├─ Bulk actions (email, SMS, etc.)
└─ Export member lists

FR-W3: Club Team/Leader Management
├─ Assign club leaders
├─ Create access for team members
├─ Define permissions per team member
├─ View team activity logs
├─ Remove team members
└─ Organize by departments/projects
```

#### Project Management (Core)
```
FR-W4: Create Projects
├─ Project name & description
├─ Date, time, location
├─ Budget & expense tracking
├─ Expected volunteers
├─ Pillar alignment (Prevention/Removal/Reduction)
├─ SDG goals selection
├─ Social media URLs
├─ Support needs
├─ Impact expectations
└─ Save as draft

FR-W5: Submit Projects for Approval
├─ Submit to District Director
├─ Add submission notes
├─ Track approval status
├─ View feedback from reviewers
└─ Resubmit after changes

FR-W6: Manage Projects
├─ View all club projects
├─ Edit draft projects
├─ Cancel/postpone projects
├─ Mark complete
├─ View participation list
└─ Export project data

FR-W7: Project Approval Dashboard (Admin)
├─ View pending approvals
├─ Review project details
├─ Approve/reject with comments
├─ Request changes
├─ See approval chain status
└─ Track approval timeline
```

#### Volunteer Management
```
FR-W8: Volunteer Directory
├─ List all volunteers
├─ Search by name/email/phone
├─ Filter by tier/status/club
├─ View volunteer profile
├─ See volunteer activity history
├─ View projects participated
├─ View marks earned
└─ Export lists

FR-W9: Volunteer Profile Management
├─ View detailed profile
├─ Edit volunteer information (as admin)
├─ View participation history
├─ View achievements
├─ View points breakdown
├─ View certificates earned
└─ Manual mark adjustments

FR-W10: Ban/Blacklist Management
├─ View banned volunteers
├─ Ban volunteer with reason
├─ Lift ban
├─ View ban appeals
├─ Approve/reject appeals
└─ Maintain ban history
```

#### Marking & Points Management
```
FR-W11: View Check-In/Check-Out Records
├─ List all check-ins for a project
├─ View attendance time
├─ View GPS location
├─ Mark as verified
├─ Manual adjustments if needed
└─ Export attendance reports

FR-W12: OC Role Assignment
├─ Assign project leadership roles (OC)
├─ Define allocated marks per role
├─ View OC members list
├─ Adjust marks after project
└─ Track mark distribution

FR-W13: Project Success Adjustment
├─ Assess project success
├─ Apply success multiplier to OC marks
├─ Document adjustment reason
├─ View final marks
└─ Approve marks
```

#### Reporting & Analytics (Comprehensive)
```
FR-W14: Volunteer Reports
├─ Individual volunteer performance
├─ Hours contributed
├─ Projects participated
├─ Points earned
├─ Tier progression
├─ Activity timeline
├─ Export as PDF/CSV

FR-W15: Project Impact Reports
├─ Environmental metrics (waste, CO2, people reached)
├─ Volunteer count
├─ Total hours
├─ Budget vs actual
├─ Project score
├─ Social media impact
└─ Export reports

FR-W16: Club/District Performance Reports
├─ Compare performance metrics
├─ Benchmark against other clubs
├─ Trend analysis (year-over-year)
├─ Top performers
├─ Activity heatmaps
└─ Geographic distribution

FR-W17: National Dashboard
├─ Real-time impact metrics
├─ Total volunteers
├─ Total projects
├─ Environmental impact
├─ Geographic heatmap
├─ Tier distribution
├─ Milestone celebrations
└─ Custom date ranges

FR-W18: Financial Reports
├─ Budget vs actual spending
├─ Project costs
├─ Variance analysis
├─ Funding sources
├─ Cost efficiency metrics
└─ Forecasting
```

#### Complaint & Dispute Management
```
FR-W19: Complaint Management
├─ View all complaints
├─ Filter by type/status
├─ View complaint details
├─ Investigate and document
├─ Request more information
├─ Resolve complaint
├─ Track resolution time
├─ Maintain complaint history

FR-W20: Appeal Management
├─ View ban appeals
├─ Review appeal content
├─ Approve/reject appeals
├─ Document decision
└─ Communicate with appellant
```

#### Inventory Management
```
FR-W21: Inventory Tracking
├─ Add/remove inventory items
├─ Set stock levels
├─ Track inventory location
├─ View usage history
├─ Set maintenance schedules
├─ Track depreciation
└─ Generate inventory reports

FR-W22: Equipment Check-Out/In
├─ View equipment availability
├─ Check out equipment to projects
├─ Check in equipment
├─ Record condition changes
├─ Flag damaged items
└─ Assign responsibility
```

#### Employee & Team Management
```
FR-W23: Staff Directory
├─ List all staff
├─ View staff profiles
├─ Assign roles & permissions
├─ Track performance
├─ View activity logs
└─ Manage access

FR-W24: Performance Management
├─ Track project approvals
├─ Measure approval efficiency
├─ Performance reviews
├─ Training records
└─ Career progression
```

#### CRM & Communication
```
FR-W25: Volunteer CRM
├─ Volunteer contact history
├─ Last engagement date
├─ Communication preferences
├─ Engagement segments
├─ Bulk email/SMS
└─ Retention tracking

FR-W26: Corporate Partner Tracking
├─ Partner profiles
├─ Partnership pipeline
├─ Sponsorship tracking
├─ CSR alignment reports
├─ Renewal management
└─ Contact history
```

#### Integrations & Automation
```
FR-W27: Monday.com Project Board
├─ View linked projects
├─ Track approval status
├─ Automated updates
└─ Team collaboration

FR-W28: Make.com Automation Management
├─ View workflow status
├─ Monitor automation execution
├─ Error logs
├─ Manual workflow triggers
└─ Workflow configuration

FR-W29: Twilio Integration
├─ Send bulk SMS/WhatsApp
├─ Verify phone numbers
├─ Track delivery
└─ Message templates
```

#### System Administration
```
FR-W30: User Management (Super Admin)
├─ Create users
├─ Assign roles
├─ Manage permissions
├─ Reset passwords
├─ View activity logs
└─ Maintain audit trail

FR-W31: System Configuration
├─ Configure app settings
├─ Manage integrations
├─ Set notification rules
├─ Configure thresholds
├─ Manage holidays/closures
└─ System health checks
```

### 4.3 Web Application Architecture

```
Web App Structure:

Layout:
├─ Top Navigation (Logo, User, Logout)
├─ Left Sidebar (Navigation Menu)
├─ Main Content Area
└─ Breadcrumbs

Pages by Role:

Volunteer:
├─ Dashboard (basic - only own data)
├─ My Projects
├─ My Profile
└─ Certificates

Club President:
├─ Dashboard (club-level stats)
├─ Volunteers List & Management
├─ Projects Management
├─ Project Creation & Submission
├─ Club Team Management
├─ Reports (club-level)
├─ Team Member Access Control
└─ Settings

District Director:
├─ Dashboard (district-level)
├─ All Clubs Overview
├─ Project Approvals
├─ Volunteer Management (district-wide)
├─ Performance Reports
├─ Ban Management
└─ District Settings

Provincial Director:
├─ Provincial Dashboard
├─ All Districts Overview
├─ Project Approvals (second level)
├─ Provincial Reports
└─ Provincial Settings

National Director:
├─ National Dashboard
├─ All Data Access
├─ Final Approvals
├─ National Reports
├─ System Configuration
└─ User Management

Data Requirements:
├─ Large data tables (1000s of rows)
├─ Complex filtering
├─ Advanced search
├─ Data export
├─ Charting & visualization
├─ Multi-step workflows
└─ Detailed forms
```

---

## 5. SHARED BACKEND API

### 5.1 Single Backend Serves Both Apps

```
Backend API (Express.js + PostgreSQL)
    │
    ├─ /api/auth/*              (Both use)
    ├─ /api/volunteers/*        (Both read, Web updates)
    ├─ /api/projects/*          (Web: full CRUD, Mobile: list + details)
    ├─ /api/checkin/*           (Mobile primary, Web views)
    ├─ /api/reports/*           (Web only)
    ├─ /api/inventory/*         (Web only)
    ├─ /api/employees/*         (Web only)
    ├─ /api/complaints/*        (Web only)
    ├─ /api/approvals/*         (Web only)
    └─ /api/admin/*             (Web only)
```

### 5.2 API Endpoint Access Control

```
Authentication Flow:
1. Both apps login via /api/auth/login
2. Backend returns JWT token
3. JWT contains: user_id, role, permissions
4. Each endpoint checks: Token + Role + Permissions

Example - Create Project:
Mobile Request → /api/projects (POST)
├─ Token checked
├─ Role checked (must be Club President+)
└─ Rejected if role is "Volunteer"

Web Request → /api/projects (POST)
├─ Token checked
├─ Role checked (must be Club President+)
└─ Allowed if authorized
```

---

## 6. USER JOURNEYS

### 6.1 Volunteer User Journey

```
Volunteer Journey: From Signup to Completion

MOBILE APP:
1. Download & Install (iOS/Android)
2. Register with phone number
   └─ SMS verification via Twilio
3. Complete profile (quick)
   ├─ Name
   ├─ Select club
   └─ Password
4. Login to app
5. Browse projects near you
6. Accept a project
7. Receive notification 24 hours before
8. Receive notification 2 hours before
9. Arrive at project location
10. Check-in via GPS
    └─ One-tap, location verified
11. Volunteer for duration
12. Check-out
    └─ Confirm hours
13. See marks added to profile
14. See points updated
15. Receive badge/tier promotion (if earned)
16. View certificate in app
17. Share achievement on social media

All done on PHONE in 30 seconds.
No web access needed.
Simple, focused experience.
```

### 6.2 Club President User Journey

```
Club President Journey: From Project Creation to Completion

WEB APPLICATION:
1. Login to web app
2. Create new project
   ├─ Name, description
   ├─ Date, time, location (map selector)
   ├─ Budget
   ├─ Pillar & SDG alignment
   ├─ Social media URLs
   └─ Save as draft
3. Review project details
4. Submit for approval
5. Monitor approval status
   ├─ District director reviewing
   ├─ Provincial director reviewing
   └─ National director approving
6. Receive approval notification
7. Project goes live
   └─ Volunteers see in app
8. Manage project volunteers
   ├─ View attendance
   ├─ View check-in/out times
   ├─ Assign OC roles
9. Mark project complete
10. Assign marks
    ├─ Volunteer marks (from check-in)
    ├─ OC marks (leadership roles)
    └─ Project success adjustment
11. Generate project report
    ├─ Impact metrics
    ├─ Participation details
    ├─ Budget vs actual
    └─ Export as PDF
12. Send thank you emails (make.com automation)
13. Generate certificates

Complex, detailed experience.
Requires significant web interface.
Volunteers DON'T use web for this.
```

### 6.3 District Director User Journey

```
District Director Journey: Project Approvals & Oversight

WEB APPLICATION:
1. Login to web app
2. View dashboard
   ├─ District stats
   ├─ Pending approvals
   ├─ Recent activity
3. Review submitted projects
   ├─ See club president's submission
   ├─ Review project details
   ├─ Request changes OR approve
4. Approve multiple projects
5. View volunteer performance across clubs
   ├─ Top volunteers
   ├─ Inactive volunteers
   ├─ Participation trends
6. Generate reports
   ├─ District-level impact
   ├─ Club comparisons
   ├─ Volunteer retention
7. Manage issues
   ├─ Handle complaints
   ├─ Ban volunteers if needed
   ├─ Approve appeals
8. Monitor team performance
   └─ Club president approval efficiency

Complex oversight & approval workflows.
Large data sets.
Multiple reports.
Can't be done on phone.
```

---

## 7. FEATURE MATRIX

### 7.1 Feature Availability by Platform

```
FEATURE                          MOBILE APP    WEB APP
────────────────────────────────────────────────────────

AUTHENTICATION:
Register                         ✅ Mobile     ✅ Web
Login                           ✅ Both       ✅ Both
Logout                          ✅ Both       ✅ Both
Password Reset                  ✅ Both       ✅ Both
─────────────────────────────────────────────────────

VOLUNTEER PARTICIPATION:
Discover Projects               ✅ App        ✅ Web (list)
Accept Project                  ✅ App        ⚠️ Web (force-join)
Reject Project                  ✅ App        ⚠️ Web (remove)
Check-In (GPS)                  ✅ App        ❌ No (mobile only)
Check-Out                       ✅ App        ❌ No (mobile only)
View Personal Points            ✅ App        ✅ Web
View Personal Tier/Badge        ✅ App        ✅ Web
View Personal Certificates      ✅ App        ✅ Web
─────────────────────────────────────────────────────

PROJECT MANAGEMENT:
Create Project                  ❌ No         ✅ Web
Edit Project                    ❌ No         ✅ Web
Submit Project                  ❌ No         ✅ Web
Approve Project                 ❌ No         ✅ Web
View Projects                   ✅ List       ✅ Detailed
Manage Volunteers on Project    ❌ No         ✅ Web
─────────────────────────────────────────────────────

VOLUNTEER MANAGEMENT:
View Volunteer List             ❌ No         ✅ Web
View Volunteer Details          ❌ No         ✅ Web
Manage Volunteer Info           ❌ No         ✅ Web
Ban Volunteer                   ❌ No         ✅ Web
View Volunteer Activity         ❌ No         ✅ Web
─────────────────────────────────────────────────────

MARKS & POINTS:
View Own Marks                  ✅ App        ✅ Web
Assign OC Marks                 ❌ No         ✅ Web
Apply Success Adjustment        ❌ No         ✅ Web
Export Mark Reports             ❌ No         ✅ Web
─────────────────────────────────────────────────────

REPORTING & ANALYTICS:
Personal Report                 ❌ No         ✅ Web
Project Report                  ❌ No         ✅ Web
Club Report                     ❌ No         ✅ Web
District Report                 ❌ No         ✅ Web
National Dashboard              ❌ No         ✅ Web
─────────────────────────────────────────────────────

TEAM MANAGEMENT:
Invite Team Members             ❌ No         ✅ Web
Grant Access                    ❌ No         ✅ Web
Manage Permissions              ❌ No         ✅ Web
View Team Activity              ❌ No         ✅ Web
─────────────────────────────────────────────────────

INTEGRATIONS:
Twilio SMS/WhatsApp             ✅ Receive    ✅ Send
Monday.com Board                ❌ No         ✅ Web
Make.com Automation             ❌ No         ✅ View
─────────────────────────────────────────────────────

INVENTORY:
View Equipment                  ❌ No         ✅ Web
Check-Out Equipment             ❌ No         ✅ Web
Check-In Equipment              ❌ No         ✅ Web
─────────────────────────────────────────────────────

ADMINISTRATION:
User Management                 ❌ No         ✅ Super Admin
System Config                   ❌ No         ✅ Super Admin
Complaints                      ❌ No         ✅ Web
Approvals                       ❌ No         ✅ Web
─────────────────────────────────────────────────────

LEGEND:
✅ = Feature available
❌ = Feature not available
⚠️  = Web allows, but not primary use
```

### 7.2 Application Size Comparison

```
MOBILE APP:
├─ Screens: ~10-12
├─ API Endpoints Used: ~15-20
├─ Data Stored Locally: ~1 MB
├─ Download Size: ~50-80 MB (approx)
├─ Essential Features Only
└─ Purpose: Volunteer participation

WEB APPLICATION:
├─ Pages: ~40-50
├─ API Endpoints Used: ~60-100
├─ Data Displayed: Unlimited
├─ Browser-based (no download)
├─ Comprehensive Management
└─ Purpose: Administration & oversight

RATIO:
Web App is ~5x more complex than Mobile App
Mobile App focuses on single use case
Web App handles all management needs
```

---

## 8. IMPLEMENTATION PRIORITY

### Phase 1: Mobile App (Weeks 1-6)
```
✅ Authentication (register, login)
✅ Project discovery
✅ Accept/reject projects
✅ Check-in/check-out with GPS
✅ View profile & points
✅ View certificates
✅ Basic notifications
└─ Done: Volunteer can use app independently
```

### Phase 2: Web App Core (Weeks 7-12)
```
✅ Club management
✅ Project creation & submission
✅ Multi-level approvals
✅ Volunteer management
✅ Mark assignment
✅ Basic reporting
└─ Done: Club president can manage projects
```

### Phase 3: Web App Advanced (Weeks 13-16)
```
✅ Analytics & reporting
✅ Complaint management
✅ Team access control
✅ Inventory management
✅ CRM functions
✅ Admin features
└─ Done: Full platform capability
```

---

## 9. TECHNOLOGY REQUIREMENTS

### Mobile App Technology
```
Framework: Flutter (Dart)
IDE: Android Studio / Xcode
SDK: Flutter 3.22+
Database: SQLite (local)
APIs: Dio (HTTP client)
State: Riverpod
Maps: Google Maps
Location: Geolocator
Push Notifications: Firebase Cloud Messaging
Build Size: 50-80 MB
Memory: ~200-300 MB
Network: Requires internet for sync
Offline: Limited (last project for check-in)
```

### Web App Technology
```
Framework: React 18+ with Vite
IDE: VS Code / WebStorm
Language: JavaScript/TypeScript
Styling: Tailwind CSS
State: Zustand / Context API
HTTP: Axios
Charts: Recharts / Chart.js
Build: Vite
Browser: Modern (Chrome, Firefox, Safari, Edge)
Size: No size limit (web app)
Performance: Fast load (<2 seconds)
Network: Requires internet
Offline: No (dashboard only)
```

### Backend (Shared)
```
Framework: Express.js
Language: Node.js 22 LTS
Database: PostgreSQL 18
ORM: Prisma
Auth: JWT
Infrastructure: Azure App Service
```

---

## 10. DATA SYNCHRONIZATION

### Mobile App to Backend

```
Check-In Data:
1. Volunteer checks in (GPS captured)
2. Data sent to backend immediately
3. Backend calculates marks
4. Points updated in database
5. Mobile app refreshes local cache

Project List:
1. Mobile app requests /api/projects
2. Backend returns available projects
3. Mobile caches locally
4. User can browse offline (cached list)
5. New projects sync when online

Notifications:
1. Backend sends push notification (Firebase)
2. Mobile receives and displays
3. User can read even if offline
4. Sync when online
```

### Web App to Backend

```
Real-time Updates:
1. Project submitted
2. Backend notifies district director
3. Web app refreshes approval list
4. Director sees new project immediately
5. Approval sent back to club president

Data Entry:
1. Form submitted
2. Validation on frontend
3. Sent to backend
4. Backend validates again
5. Database updated
6. Confirmation returned
```

---

## 11. USER ROLES CLARIFICATION

### Mobile App Users
```
Only ONE role:
├─ Volunteer
└─ Features: Check-in, view achievements, accept projects
```

### Web App Users
```
Multiple possible roles:
├─ Volunteer (basic web access - view own data)
├─ Club President (club management)
├─ Club Officer (club assistance)
├─ District Director (approvals, oversight)
├─ Provincial Director (higher approvals)
├─ National Director (final approvals, system admin)
├─ System Admin (user management)
├─ Finance Manager (financial reports)
├─ HR Manager (staff management)
└─ Various team members with specific permissions
```

---

## 12. DECISION: WEB VS MOBILE FOR ACTIVITIES

### Management Activities → WEB APP (Required)

```
These MUST be on web:
├─ Create new project
├─ Submit project for approval
├─ Approve projects (multi-level)
├─ View detailed volunteer information
├─ Manage team members & access
├─ Assign OC roles and marks
├─ Generate reports & analytics
├─ Review complaints
├─ Ban/unban volunteers
├─ Export data
├─ Complex workflows
└─ Reason: Require large screens, detailed forms, complex data
```

### Volunteer Activities → MOBILE APP (Where Essential)

```
These go on MOBILE:
├─ Discover projects
├─ Accept/reject invitations
├─ Check-in to project
├─ Check-out from project
├─ View badges & achievements
├─ View points & tier
├─ View certificates
└─ Reason: Quick actions, single-tap decisions, on-the-go

These can ALSO be on WEB:
├─ View personal dashboard
├─ View achievement history
├─ Download certificates
└─ Reason: Some volunteers may want to see on larger screen
```

### FLEXIBLE: Can be Either (User's Choice)

```
Optional for web:
├─ View upcoming projects (if logged in)
├─ View personal stats
├─ Accept project (web can force-join)
└─ Reason: Some volunteers may prefer web interface

But PRIMARY access should be MOBILE for these.
Web version is bonus.
```

---

## 13. FINAL ARCHITECTURE DECISION

### Principle: "Mobile for Doing, Web for Managing"

```
MOBILE APP (Volunteer Experience):
├─ Purpose: Enable participation
├─ Size: MINIMAL (50-80 MB)
├─ Features: ~12 pages
├─ API Calls: ~15-20 endpoints
├─ User: Individual volunteers
├─ Time per session: 2-5 minutes
└─ Philosophy: "Fast, simple, focused"

WEB APPLICATION (Leadership Experience):
├─ Purpose: Enable management
├─ Size: Unlimited (web app)
├─ Features: ~40-50 pages
├─ API Calls: ~60-100 endpoints
├─ User: Club presidents, directors, admins
├─ Time per session: 10-60 minutes
└─ Philosophy: "Comprehensive, detailed, powerful"

RESULT:
├─ Light mobile app (no bloat)
├─ Powerful web app (all management)
├─ Single backend serves both
├─ Clear division of responsibility
└─ Optimal user experience for each role
```

---

## 14. IMPLEMENTATION ROADMAP

### Mobile App Development
```
Week 1-2: Auth + Project Discovery
Week 3-4: Check-In/Out + GPS
Week 5-6: Achievements + Notifications
└─ Complete MVP: Volunteer can fully participate
```

### Web App Development
```
Week 1-2: Auth + Club Dashboard
Week 3-4: Project Management + Approval Workflow
Week 5-6: Volunteer Management
Week 7-8: Reporting + Analytics
Week 9-10: Advanced Features
└─ Complete MVP: Club president can manage projects
```

### Parallel Development
```
Both teams develop simultaneously
Sharing same backend API
Mobile app finished in ~6 weeks
Web app finished in ~10 weeks
Phased rollout to users
```

---

**SUMMARY:**

You've identified a smart architectural decision:
- ✅ **Minimal Mobile App** focused solely on volunteer participation
- ✅ **Comprehensive Web App** for all management functions
- ✅ **Single Backend API** serves both applications
- ✅ **Clear division** of responsibility
- ✅ **Optimal user experience** for each role

This reduces mobile app complexity while maximizing management capabilities.

