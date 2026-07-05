# Zero Plastic Platform
## Updated Requirements Specification - Mobile App vs Web Application Division

**Version:** 3.0 (Architecture Clarification)  
**Date:** July 2026  
**Status:** Ready for Implementation  
**Key Update:** Clear separation between Volunteer Mobile App (minimal) and Web-Based Management Application (comprehensive)  

---

## ADDENDUM — REQUIREMENTS CLARIFICATIONS (July 2026)

The following decisions were confirmed and supersede any conflicting statements elsewhere in this document set:

1. **Chapter = Club.** "Chapter" and "Club" refer to the same entity. "Club" is the canonical term used in the data model and UI.
2. **Events are distinct from Projects, but nest freely.**
   - A **Project** is a larger initiative (e.g. a beach cleanup campaign).
   - An **Event** is a smaller occurrence — a monthly meetup, or a team discussion to plan a project.
   - A **Chapter (Club)** can directly own both Projects and Events.
   - A **Project** can also have its own Events nested under it (e.g. planning meetings for that specific project).
   - Both structures are valid simultaneously — Events are not required to belong to a Project.
3. **HQ staff need a Trello-style task tracker** for internal head-office staff management (see FR-W23a).
4. **No AI automation will be built.** Ignore prior mentions of AI-driven workflows. FR-W28 (Make.com Automation Management) is removed from scope. Twilio remains only as a plain SMS/WhatsApp integration (OTP, reminders), not an automation/AI layer.
5. **No public API.** Instead, a **Corporate Portal** (see FR-W26a) shows HQ-approved projects to corporate visitors, who can (a) request to join as a volunteer, or (b) express interest in supporting as a partner/sponsor. This is a lead-capture portal, not an open API.
6. **No donation feature.** Do not build payment/donation collection anywhere, including in the Corporate Portal — sponsor interest is captured as a lead only.
7. **Authority-based notification broadcasting** (see FR-W25a): approval/cancellation events fire emails, and authorized roles can additionally broadcast manually to: all volunteers platform-wide, all volunteers on a specific project, or all volunteers in a specific chapter/club.
8. **Corporate Benefits & Offers program** (see FR-M11a/b, FR-W26b/c/d): corporate partners create points-gated discounts/benefits (e.g. 1000 marks unlocks a discount from Company X). Every volunteer has a unique membership ID. Corporates use a redemption verification portal — enter the volunteer's ID, the system checks eligibility (points threshold, validity), and the corporate marks the offer redeemed. This updates the volunteer's profile (offer taken, voucher redeemed) and feeds two reporting views: the corporate sees one-to-one redemption detail plus their own aggregate counts, and HQ sees full cross-corporate visibility.
9. **No-app web parity for volunteers** (see FR-W0a): anyone who doesn't want to install the mobile app must be able to do everything a volunteer needs from a plain browser URL — discover, accept/decline, **check-in and check-out (via browser geolocation)**, and view points/badges/certificates. This overrides the earlier "check-in/out is mobile-only" rule found elsewhere in this document set.
10. **Every project has a public page, like a blog post** (see FR-W0b): a no-login-required URL per project with title, description, images, dates, and impact — readable and shareable by anyone. Each page carries two calls to action: "Join as Volunteer" and "Support as Partner/Sponsor." This is the mechanism the Corporate Portal (FR-W26a) links out to — one public page per project serves both general-public and corporate visitors.
11. **Points and Hours are tracked separately, per volunteer per project.** **Points** are a value HQ/Chapter admins *decide* for a given project or activity (a business decision, not derived from time worked). **Hours** are the global, standard metric — auto-calculated from each check-in→check-out duration — and every project must define/track the hours its volunteers contribute. Points feed the tier/badge/offer-eligibility system; hours feed impact/CSR reporting. The two numbers are independent of each other.
12. **Flash Reward Drops — segmented, time-bound, limited-quantity engagement posts** (see FR-W25b / FR-M12a): admin/district-level users (Club President, District Director, HQ) can post a limited-quantity reward (e.g. "5 t-shirts, first come first served"). Two things make this different from a normal broadcast: (a) it is **not sent to everyone** — the creator defines an eligibility segment by points/marks criteria (e.g. volunteers ≥ 1000 marks get one drop, volunteers < 1000 marks get a different one aimed at encouraging them to earn more), and (b) claiming is **first-come-first-served** against a fixed quantity — the first N eligible volunteers to tap "Claim" get it, everyone after sees "already claimed, you were too late." It appears on the volunteer's phone as a feed **post** (image, title, description, live countdown, remaining-quantity counter), not just a push alert. This extends FR-W25a's audience scoping (platform-wide / project / chapter) to also support points-threshold segments.
13. **Professional/Corporate Volunteers — a non-ground volunteer profile registered at District level** (see FR-M1a/b, FR-W25c): during registration, a volunteer picks a type. "Ground Volunteer" is the existing flow (selects a Club, does check-in/out on projects). "Professional/Corporate Volunteer" is a separate profile for individuals who won't do in-person project work but can instead offer expert support — creating partnerships, linking volunteers to opportunities, or providing specialized skills. This profile captures workplace, industry, and one or more self-selected expertise areas (e.g. internship opportunities, financial budgeting, document creation, digital marketing — an extensible tag list), and is submitted at the **District** level rather than to a Club, since these professionals aren't club-affiliated. Registered professionals form a searchable pool: District Directors (and above) filter by expertise/industry and reach out ad hoc ("we're looking for a partnership, would you mind helping us?") via Email/WhatsApp — outreach happens off-platform, there is no accept/decline project flow or check-in for this profile type. Distinct from Corporate Partner Tracking (FR-W26), which tracks companies/organizations, not individual professionals.

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
├─ Individual Volunteers — Ground Volunteer profile (general volunteers, not in management roles)
└─ Individual Volunteers — Professional/Corporate Volunteer profile (experts registered at District level; see FR-M1b)

Access Level:
├─ Own profile only
├─ Ground Volunteer: view assigned projects, check-in/out, badges/achievements
├─ Professional/Corporate Volunteer: own expertise profile only — no projects, no check-in
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
│   └─ USE: Mobile App, OR the web check-in URL if I don't have the app
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

FR-M1a: Volunteer Type Selection (at registration)
├─ Registrant picks a profile type before the rest of the form branches:
│   ├─ Ground Volunteer → existing flow above (selects a Club, does project check-in/out)
│   └─ Professional/Corporate Volunteer → FR-M1b below (selects a District, no Club, no check-in)
└─ Purpose: fork onboarding without running two separate apps/flows

FR-M1b: Professional Volunteer Profile (Corporate/Expert Registration)
├─ Workplace / organization name
├─ Industry / sector
├─ One or more areas of expertise (multi-select, extensible tag list) — e.g.:
│   ├─ Internship opportunities
│   ├─ Financial budgeting
│   ├─ Document creation
│   ├─ Digital marketing
│   └─ (additional specialized areas, admin-configurable)
├─ Preferred contact channel (WhatsApp / Email / Phone)
├─ Submitted at District level for review (no Club, since not club-affiliated)
├─ No check-in/out, no accept/decline project flow — this profile does not participate in ground projects
└─ Purpose: build a searchable pool of professional supporters (see FR-W25c)

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
├─ Hours auto-calculated from check-in→check-out duration (the global, standard attendance metric)
├─ Points credited per the value HQ/Chapter admins set for this project — independent of hours logged
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

#### Benefits & Offers (Corporate Rewards)
```
FR-M11a: View Available Offers
├─ List of corporate discounts/benefits
├─ Offers unlocked at current points/marks vs offers still locked
├─ Offer details: corporate name, benefit description, points threshold, validity/expiry, terms
└─ Purpose: Real-world reward for volunteering (e.g. 1000 marks unlocks a discount from Company X)

FR-M11b: View My Membership ID
├─ Unique volunteer membership ID, shown as number + QR code
├─ Presented to corporate partner staff to redeem an unlocked offer
└─ Purpose: Identity/eligibility verification at redemption

FR-M11c: View My Redemption History
├─ List of offers redeemed, with date and corporate name
└─ Purpose: Track what's already been claimed
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

FR-M12a: Flash Reward Post (see FR-W25b for admin-side creation)
├─ Only appears for volunteers matching the admin-defined segment — never sent to everyone
├─ Rendered as a feed post: image, title, description, live countdown to expiry, remaining-quantity counter (e.g. "3 of 5 left")
├─ Single "Claim" button — no form, tap-to-claim
├─ Immediate result: "You got it! 🎉" or "All claimed — you were too late"
└─ Claimed rewards listed in "My Rewards" alongside Corporate Offers (FR-M11a/b)

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

#### Volunteer Web Access & Public Project Pages (No App Required)
```
FR-W0a: Volunteer Web Participation Portal
├─ Full parity with mobile for volunteers who don't want to install the app
├─ Login via browser (same auth/JWT as mobile)
├─ Discover projects & events (list/map)
├─ Accept/decline a project or event invitation
├─ Check-in via URL (browser geolocation, GPS verification)
├─ Check-out via URL (browser geolocation, confirm hours)
├─ View points, tier, badges, certificates
├─ View & redeem available offers (shows membership ID)
└─ Purpose: The app is a convenience, never a requirement, for participation

FR-W0b: Public Project Page (Blog-style)
├─ Every project gets a public, no-login-required URL
├─ Blog-style layout: title, description, images, dates, location, impact goals
├─ Shareable / SEO-indexable
├─ Two calls to action on the page:
│   ├─ "Join as Volunteer" (routes to login/register, then joins the project)
│   └─ "Support as Partner/Sponsor" (interest form only — no payment, per Addendum #6)
└─ Serves both general-public and corporate visitors — the Corporate Portal (FR-W26a) links out to these same pages rather than duplicating them
```

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
├─ Points value awarded to participating volunteers (admin-decided, independent of hours)
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
```

#### Event Management (distinct from Projects, but nestable)
```
FR-W6a: Create Events
├─ Event name & description
├─ Event type (Monthly Meetup / Planning Discussion / Project-related Activity)
├─ Date, time, location (physical or virtual)
├─ Parent: either a Chapter/Club directly, OR a specific Project
├─ Expected attendees
└─ Save as draft

FR-W6b: Manage Events
├─ View all chapter events (standalone + project-linked)
├─ View all events nested under a given project
├─ Edit event details
├─ Cancel/postpone event
├─ Mark event complete
├─ View attendee list
└─ Export event data

Relationship Rule:
├─ A Chapter/Club can have Projects AND Events directly
├─ A Project can have its own Events nested under it (e.g. planning meetings)
└─ An Event never requires a parent Project — a monthly chapter meetup stands alone
```

```
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
├─ View unique membership ID
├─ View offer redemption history
└─ Manual mark adjustments

FR-W10: Ban/Blacklist Management
├─ View banned volunteers
├─ Ban volunteer with reason
├─ Lift ban
├─ View ban appeals
├─ Approve/reject appeals
└─ Maintain ban history
```

#### Marking, Points & Hours Management
```
FR-W11: View Check-In/Check-Out Records
├─ List all check-ins for a project
├─ View attendance time (check-in → check-out duration = Hours, the global standard metric)
├─ View GPS location
├─ Mark as verified
├─ Manual adjustments if needed (hours)
└─ Export attendance/hours reports

FR-W12: OC Role Assignment
├─ Assign project leadership roles (OC)
├─ Define allocated points per role (on top of the project's base points value)
├─ View OC members list
├─ Adjust points after project
└─ Track points distribution

FR-W13: Project Success Adjustment
├─ Assess project success
├─ Apply success multiplier to OC points (points only — hours are never multiplied)
├─ Document adjustment reason
├─ View final points
└─ Approve points

Note: Points and Hours are independent fields per volunteer per project.
├─ Points = admin-decided value for the project/activity (+ OC bonus, ± success multiplier)
└─ Hours = auto-calculated from check-in/check-out timestamps, unaffected by point adjustments
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

#### HQ Task Management (Trello-style Tracker)
```
FR-W24a: Task Board (Kanban)
├─ Create tasks/cards for HQ staff work
├─ Organize into columns (To Do / In Progress / Done — customizable)
├─ Assign tasks to one or more HQ staff members
├─ Set due dates & priority
├─ Add comments/attachments per task
├─ Drag-and-drop status updates
├─ Filter/search tasks by assignee or status
└─ Purpose: Internal head-office staff work management, Trello-style
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

FR-W25a: Notification Broadcast (Authority-based)
├─ Auto-fires email on project/event Approval or Cancellation
├─ Manual broadcast option for authorized roles
├─ Audience scoping:
│   ├─ All volunteers (platform-wide)
│   ├─ All volunteers on a specific Project
│   ├─ All volunteers in a specific Chapter/Club
│   └─ A points/marks-threshold segment (see FR-W25b) — e.g. "≥1000 marks" or "<1000 marks"
├─ Delivery via Email (primary); SMS/WhatsApp via Twilio for reminders only
└─ Access scoped by role — e.g. Club President limited to own chapter, National Director platform-wide

FR-W25b: Flash Reward Drop (Segmented, Time-Bound, Limited-Quantity)
├─ Authorized role (Club President / District Director / HQ) creates a Flash Reward:
│   ├─ Title, description, image, reward item
│   ├─ Total quantity available (e.g. 5 t-shirts)
│   ├─ Claim window — start time and end time (auto-expires)
│   └─ Eligibility segment — points/marks threshold, tier, and/or chapter/club (reuses FR-W25a's audience scoping, plus points-threshold criteria)
├─ At send time, the notification/post goes ONLY to volunteers matching the segment — never a blanket blast
├─ Claiming is first-come-first-served: the server processes "Claim" taps in arrival order and stops once quantity hits zero
├─ Volunteers who tap after quantity is exhausted see "All claimed — you were too late," with the depleted count already visible on the post
├─ Reward auto-closes at the window's end time even if quantity remains unclaimed
├─ Admin view: live remaining-quantity count, list of claimants, fulfillment/delivery status
└─ Distinct from Corporate Offers (FR-W26b): Flash Rewards are HQ/Chapter-issued and claim-based (first-come, fixed quantity), not corporate-issued and threshold-redemption-based

FR-W25c: Professional Volunteer Directory (Expert Pool)
├─ District Director (and above) views Professional/Corporate Volunteers submitted to their district (FR-M1b)
├─ Filter/search by expertise tag, industry, workplace
├─ View profile: workplace, industry, expertise tags, preferred contact channel
├─ "Request Support" action — select one or more professionals, compose an outreach message (e.g. "We're looking for a partnership, would you mind helping us?")
├─ Sends via Email or WhatsApp (Twilio) — outreach itself happens off-platform; the system only initiates it
├─ Outreach history tracked per professional (contacted, responded, engaged) — feeds Volunteer CRM (FR-W25)
└─ Distinct from Corporate Partner Tracking (FR-W26): this tracks individual professionals and their personal expertise, not companies/organizations

FR-W26: Corporate Partner Tracking
├─ Partner profiles
├─ Partnership pipeline
├─ Sponsorship tracking
├─ CSR alignment reports
├─ Renewal management
└─ Contact history

FR-W26a: Corporate Portal (external-facing, not a public API)
├─ Directory page listing HQ-APPROVED projects only, aimed at corporate visitors
├─ Each listing links to that project's own Public Project Page (FR-W0b) for full detail and the Join/Support actions
├─ Submissions route into Corporate Partner Tracking (FR-W26) for HQ follow-up
└─ No open/public API endpoints exposed; no donation or payment processing

FR-W26b: Corporate Offer Management
├─ Corporate partner (or HQ on their behalf) creates an offer/benefit
├─ Set required points/marks threshold (e.g. 1000 marks → discount)
├─ Set offer description, terms, validity period, redemption limit
├─ HQ approval gate before an offer goes live to volunteers
└─ Edit/deactivate an existing offer

FR-W26c: Redemption Verification Portal (Corporate-facing)
├─ Corporate staff logs into their portal
├─ Enter volunteer's unique membership ID
├─ System verifies: valid volunteer, meets points threshold, offer still valid/not already used
├─ Corporate confirms and marks the offer as redeemed
└─ Volunteer profile auto-updates: offer taken, voucher redeemed, redemption date

FR-W26d: Redemption Reporting
├─ Corporate view: one-to-one detail of volunteers who redeemed their offers
├─ Corporate view: aggregate counts (per offer, per period)
└─ HQ view: cross-corporate visibility — all offers, all redemptions, all volunteers
```

#### Integrations
```
FR-W27: Monday.com Project Board
├─ View linked projects
├─ Track approval status
├─ Automated updates
└─ Team collaboration

FR-W29: Twilio Integration (basic messaging only — no AI/automation)
├─ Send bulk SMS/WhatsApp
├─ Verify phone numbers
├─ Track delivery
└─ Message templates

Note: Make.com automation and any AI-driven automation are OUT OF SCOPE (see Addendum, item 4).
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
    ├─ /api/events/*            (Web: full CRUD, standalone or project-nested; Mobile: list + details)
    ├─ /api/checkin/*           (Mobile + Web via browser geolocation; both are primary)
    ├─ /api/projects/:slug/public (Public — no auth — blog-style project page)
    ├─ /api/reports/*           (Web only)
    ├─ /api/inventory/*         (Web only)
    ├─ /api/employees/*         (Web only)
    ├─ /api/tasks/*             (Web only — HQ task tracker)
    ├─ /api/corporate/*         (Public portal read; lead submission — no auth required to view)
    ├─ /api/offers/*            (Web: corporate/HQ manage; Mobile: eligible-offers list)
    ├─ /api/redemptions/*       (Web: corporate verify+redeem, HQ/corporate reporting; Mobile: own history)
    ├─ /api/notifications/broadcast (Web only — authority-scoped, includes points-threshold segments)
    ├─ /api/flash-rewards/*     (Web: admin/district create+manage; Mobile: eligible feed + claim)
    ├─ /api/professionals/*     (Mobile: own profile create/edit; Web: District+ directory, filter, outreach)
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
12. Send thank you emails (automated email notification)
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
Check-In (GPS)                  ✅ App        ✅ Web (browser geolocation, via URL)
Check-Out                       ✅ App        ✅ Web (browser geolocation, via URL)
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
─────────────────────────────────────────────────────
(Make.com/AI automation: OUT OF SCOPE — see Addendum)

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
3. On check-out, backend calculates Hours from check-in→check-out duration
4. Points credited per the project's admin-defined points value (independent of hours)
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
Only ONE role, with two profiles:
├─ Volunteer — Ground profile: Check-in, view achievements, accept projects
└─ Volunteer — Professional/Corporate profile: expertise directory listing only, no projects/check-in (see FR-M1a/b)
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

### Volunteer Activities → MOBILE APP (Where Essential), Also Available via Web URL

```
These go on MOBILE, and equally work from a browser URL (no app required — FR-W0a):
├─ Discover projects
├─ Accept/reject invitations
├─ Check-in to project (browser geolocation on web)
├─ Check-out from project (browser geolocation on web)
├─ View badges & achievements
├─ View points & tier
├─ View certificates
└─ Reason: Quick actions, single-tap decisions, on-the-go — the app is the fast path, the web URL is the no-install fallback

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

### Principle: "Mobile for Doing, Web for Managing — with No-App Web Parity for Doing"

> Amendment (Addendum #9): the app is never a hard requirement to participate. Every mobile "Doing" action — discover, join, check-in, check-out, view achievements — also works from a plain web URL via FR-W0a, for volunteers who don't want to install the app.

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

