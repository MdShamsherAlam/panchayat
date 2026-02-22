# 📄 Gram Panchayat CMS — Project Submission Document

**Project Title:** Digital Complaint Management System for Gram Panchayat  
**Submission Date:** 22 February 2026  
**Technology Used:** React.js, Node.js, Express.js, MySQL, Sequelize, JWT  
**Development Approach:** AI-Assisted Full-Stack Development using Antigravity (Google DeepMind)

---

## 1. PROJECT OVERVIEW

### Problem Statement
Rural India's gram panchayats receive hundreds of citizen complaints monthly about roads, water supply, drainage, electricity, and public facilities. These complaints are managed manually — via paper registers or phone calls — causing delays, lost complaints, zero accountability, and no SLA tracking.

### Solution
A bilingual (Hindi/English) digital complaint management platform that allows:
- Citizens to file complaints from mobile/desktop with photo and GPS support
- Officials to manage, assign, and resolve complaints with SLA monitoring
- Admins to track system-wide analytics and escalations

### Impact
- Zero paper-based complaint tracking
- Real-time status updates via Tracking ID
- SLA enforcement (7-day deadline with automatic escalation)
- Full audit trail via History timeline

---

## 2. STEPS FOLLOWED IN DEVELOPMENT

### Step 1: Project Setup & Architecture
- Designed the system architecture (3-tier: Frontend, Backend API, MySQL DB)
- Decided on folder structure: MVC pattern with Service layer
- Set up `concurrently` to run Frontend + Backend simultaneously
- Created `package.json` scripts: `start-all`, `backend`, `frontend`, `seed`

### Step 2: Backend Foundation
- Set up Express.js with cluster mode for multi-core performance
- Configured Sequelize ORM with `sync({ alter: true })` for automatic table creation
- Implemented CLS-hooked transactions for safe database writes
- Created environment configuration using dotenv

### Step 3: Database Models
- **Role**: admin, official, citizen (with `slug` field)
- **User**: linked to Role via FK, with bcrypt-hashed passwords
- **Complaint**: trackingId, status ENUM, SLA deadline, escalation flags, priority
- **History**: full audit trail of every status change
- **Attachment**: photo uploads linked to complaints

### Step 4: Authentication System
- JWT-based authentication with 24-hour token expiry
- Role-based access control middleware (`auth(['citizen'])`, `auth(['official', 'admin'])`)
- Separate register/login endpoints with proper HTTP status codes (401, 409, 400)
- Auto-seed of roles and admin user in `connectDB()` boot sequence (idempotent)

### Step 5: Complaint APIs & Logic
- `POST /submit` — file upload (Multer), tracking ID generation, SLA calculation
- `GET /track/:id` — public tracking with full history timeline
- `GET /ward` — role-aware (officials see their ward, admins can query any ward)
- `PATCH /:id/status` — step-by-step status workflow (Open → In Progress → Resolved → Closed)
- `PATCH /:id/assign` — field staff assignment (auto sets In Progress)
- `PATCH /:id/escalate` — manual + auto SLA breach escalation
- **Auto-Assign Logic**: Implemented Phase 3 logic to automatically assign officials based on Ward Number.
- **Citizen Review**: Implemented Phase 6 logic allowing citizens to Accept/Reject resolutions.
- **SLA Engine**: Built a background job (Phase 7) in `www.js` that checks for breached deadlines every 5 minutes.

### Step 6: Frontend & Map Integration
Built 6 pages with a consistent rural Panchayat theme:
1. **Homepage** — Hindi hero section, how-it-works, roles overview, FAQ accordion.
2. **Login** — Split-panel design, role-aware redirect, admin credentials hint.
3. **Register** — Radio card role selection, conditional ward number field.
4. **Citizen Dashboard** — 2 tabs: Submit and Track.
    - **Map Pin UI (Phase 2)**: Integrated Leaflet maps for manual location pinning.
    - **Ward Auto-detect (Phase 2)**: Coordinates-based ward detection logic.
5. **Official Dashboard** — 7 filter tabs, SLA timers, 3-tab action modal (Status/Assign/Escalate).
6. **Admin Dashboard** — Resolution rate, 4 KPI cards, progress bar breakdown, system health.

### Step 7: Premium UI Design (Phase Spec Alignment)
- **Glassmorphism**: Applied modern blur effects, gradients, and rounded layouts (2.5rem corners).
- **Color palette**: Earthy greens (`green-700/800`) + Ambers (`amber-500/600`) + Warm background (`#fcf9f2`).
- **Font**: Mukta (Google Fonts, designed for Hindi/Devanagari compatibility).
- **Accessibility**: Hindi labels throughout for rural usability.

### Step 8: Bug Fixes & Git Configuration
- **Stability Fix**: Resolved React context crashes related to `react-leaflet` versioning.
- **Dependency Optimization**: Downgraded to stable `react-leaflet@4.2.1`.
- **Git Tracking Fix**: Reconfigured `.gitignore` to include `.env` files and ensure proper folder-wise tracking for GitHub.

---

## 3. PROMPTS USED

The following prompts were given to the AI agent (Antigravity) during development:

1. *"Create a full-stack project setup with React frontend and Node.js/Express backend for a Gram Panchayat complaint management system"*

2. *"Add Sequelize models for Role, User, Complaint, History and Attachment with proper foreign keys and associations"*

3. *"Implement JWT authentication with role-based access control — citizen, official, and admin roles"*

4. *"Create complaint submission, tracking, ward listing, and status update APIs"*

5. *"Redesign all pages with a rural Panchayat theme — Hindi labels, earthy colors, Mukta font"*

6. *"All db tables and tables should be auto create, end to end test then fix it"*

7. *"Officials get a role-based dashboard to: view ward-wise complaints, assign to field staff, update status (Open → In Progress → Resolved → Closed), monitor SLA timers, handle escalation"*

8. *"Submission ke liye: video walkthrough, GitHub repo, Word document"*

9. *"Apply a premium, digital-first theme (glassmorphism) to all dashboards"*

10. *"Ensure .env files and all project folders are correctly tracked by Git"*

---

## 4. TOOLS / AGENTS USED

| Tool | Purpose |
|------|---------|
| **Antigravity (Google DeepMind)** | Primary AI coding agent — generated all code, debugged errors, designed UI, wrote tests |
| **VS Code** | Code editor / IDE |
| **MySQL Workbench** | Database inspection and verification |
| **Chrome DevTools (Network Tab)** | API request/response debugging |
| **Postman / PowerShell** | API endpoint testing |
| **Git** | Version control and GitHub publish |
| **npm / concurrently** | Package management and multi-process runner |

### AI Agent Details
- **Agent**: Antigravity by Google DeepMind
- **Mode**: Agentic (autonomous, multi-step task execution)
- **Capabilities used**: File creation/editing, terminal command execution, codebase search, error debugging, browser-based testing

---

## 5. DEVELOPMENT METHOD

### Method: AI-Assisted Rapid Prototyping

**Approach**: Human-in-the-loop development where the developer provides high-level requirements in natural language (including Hindi) and the AI agent generates, tests, and fixes the code autonomously.

**Workflow**:
```
Developer gives requirement (Hindi/English)
        ↓
AI Agent reads existing codebase
        ↓
AI generates plan (implementation_plan.md)
        ↓
Developer reviews + approves
        ↓
AI writes code files
        ↓
AI runs terminal commands to test
        ↓
AI reads error logs + self-corrects
        ↓
AI verifies end-to-end
        ↓
Developer reviews output
```

**Key Principles Applied**:
- **Separation of Concerns**: Controller → Service → Model (3 distinct layers)
- **DRY**: Shared BaseService, centralized model index, reusable auth middleware
- **Fail-safe DB**: `sync({ alter: true })` — never drops existing data, always safe to deploy
- **Idempotent operations**: Seeds always safe to re-run
- **Security**: Passwords hashed with bcrypt, JWT expiry, role validation on every protected route

**Total Development Time**: ~2 hours (from scratch to full-stack working app)

---

## 6. DATABASE SCHEMA DIAGRAM

```
┌─────────────┐         ┌─────────────────┐         ┌──────────────────────┐
│   roles     │         │     users       │         │      complaints      │
├─────────────┤         ├─────────────────┤         ├──────────────────────┤
│ id (PK)     │◄────────│ id (PK)         │◄────────│ id (PK)              │
│ name        │  roleId │ name            │citizenId│ trackingId (UNIQUE)  │
│ slug        │         │ email (UNIQUE)  │officialId│ title               │
└─────────────┘         │ password(bcrypt)│         │ description          │
                         │ wardNo          │         │ status (ENUM)        │
                         └─────────────────┘         │ priority (ENUM)      │
                                                     │ wardNo               │
                         ┌─────────────────┐         │ geoTag (JSON)        │
                         │   attachments   │         │ slaDeadline          │
                         ├─────────────────┤         │ isEscalated          │
                         │ id (PK)         │◄────────│ assignedStaff        │
                         │ url             │complaintId└──────────────────────┘
                         │ filename        │                    │
                         │ fileType        │                    │
                         └─────────────────┘         ┌──────────────────────┐
                                                     │     histories        │
                                                     ├──────────────────────┤
                                                     │ id (PK)              │
                                                     │ event (Hindi desc.)  │
                                                     │ previousStatus       │
                                                     │ newStatus            │
                                                     │ comment              │
                                                     │ complaintId (FK)     │
                                                     │ performedById (FK)   │
                                                     └──────────────────────┘
```

---

## 7. INSTALLATION INSTRUCTIONS

See `README.md` for full installation guide. Quick start:

```bash
git clone https://github.com/YOUR_USERNAME/panchayat.git
cd panchayat
npm install && cd backend && npm install && cd ../frontend && npm install && cd ..
# Edit backend/.env with your MySQL password
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS panchayat;"
npm run start-all
# → Open http://localhost:5173
```

**Default Admin**: `admin@panchayat.gov.in` / `123456`

**SQL reference for Admin Insert:**
```sql
INSERT INTO `users` (`id`, `name`, `email`, `password`, `wardNo`, `roleId`, `createdAt`, `updatedAt`) 
VALUES (NULL, 'admin', 'admin@panchayat.gov.in', '$2a$10$.x99mhQTZL.bRruCPBeau.Ko0u6iSRySzOj4ePZkBihWJv33aGs7S', NULL, '1', '2026-02-22 15:36:41', '2026-02-22 16:59:07');
```

---

## 8. VIDEO WALKTHROUGH SCRIPT

*(3–4 minute demo coverage)*

| Timestamp | Screen | What to show |
|-----------|--------|--------------|
| 0:00–0:20 | Homepage | Show hero section, how-it-works, FAQ |
| 0:20–0:40 | Register | Register as citizen with ward no. 5 |
| 0:40–1:10 | Citizen Dashboard | Submit a complaint — title, desc, photo upload |
| 1:10–1:30 | Track Tab | Copy tracking ID, see submitted in timeline |
| 1:30–2:00 | Official Login | Login as official (register with roleSlug=official) |
| 2:00–2:40 | Official Dashboard | Show ward complaints, SLA timers, filter tabs |
| 2:40–3:10 | Official Modal | Assign field staff, update status to In Progress |
| 3:10–3:30 | Escalate | Mark complaint as escalated, see red pulse dot |
| 3:30–3:50 | Admin Login | Login as admin@panchayat.gov.in |
| 3:50–4:00 | Admin Dashboard | Show KPI cards, resolution rate, system health |

---

## 9. PROMPT BLUEPRINT (FOR HACKATHON)
A detailed breakdown of all prompts and the agentic development workflow can be found in:
[PROMPT_BLUEPRINT.md](file:///c:/shamsher/panchayat/docs/PROMPT_BLUEPRINT.md)

---

*Document prepared for academic/competition submission.*
*Generated with AI-assistance (Antigravity by Google DeepMind).*
