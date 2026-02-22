# 🏛️ Gram Panchayat — Digital Complaint Management System

**A full-stack web application to digitize complaint management for rural Indian gram panchayats.**  
Built with React, Node.js, Express, and MySQL using Sequelize ORM.

---

## 📋 Table of Contents
- [About the Project](#about)
- [Features](#features)
- [Technology Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [API Reference](#api-reference)
- [Default Credentials](#default-credentials)
- [Folder Structure](#folder-structure)

---

## 🌟 About the Project <a name="about"></a>

This system allows citizens of a gram panchayat to submit complaints digitally (road damage, water supply, electricity, etc.) and track their resolution status in real-time. Officials can manage, assign, and resolve complaints with full audit trail. Admins get a full analytics dashboard.

---

## ✅ Features <a name="features"></a>

### 👨‍🌾 Citizen (Nagarik)
- Register/Login with ward number
- Submit complaints with photo upload + GPS location tagging
- Get a unique Tracking ID (e.g., `COMP-1740234567-892`)
- Track complaint status on a live timeline
- Hindi language interface for accessibility

### 👨‍💼 Panchayat Official (Adhikari)
- View all complaints in their ward
- Assign field staff to a complaint (auto-sets status to "In Progress")
- Update complaint status: `Open → In Progress → Resolved → Closed`
- Manually escalate urgent complaints
- Monitor SLA timers with color-coded urgency (green/orange/red/expired)
- Filter by status, escalated, or SLA-expired complaints

### 🖥️ Admin
- View system-wide analytics: total, escalated, resolution rate
- See status-wise breakdown with progress bars
- Monitor system health (DB, API, memory)
- Automatic SLA breach escalation

---

## 🛠️ Technology Stack <a name="tech-stack"></a>

| Layer         | Technology                                      |
|---------------|-------------------------------------------------|
| Frontend      | React 18, Vite, React Router, Axios, React Hot Toast |
| Backend       | Node.js, Express.js, Cluster mode (multi-core) |
| Database      | MySQL 8+, Sequelize ORM (auto sync + alter)     |
| Auth          | JWT (jsonwebtoken), bcryptjs                    |
| File Upload   | Multer                                          |
| Real-time     | Socket.IO                                       |
| Transactions  | cls-hooked (CLS-driven Sequelize transactions)  |
| Process Mgmt  | cluster (Node.js built-in)                      |
| Dev Tool      | concurrently (run backend + frontend together)  |

---

## 🗄️ Database Schema <a name="database-schema"></a>

### Tables

#### `roles`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR | "Citizen", "Panchayat Official", "Administrator" |
| slug | VARCHAR UNIQUE | "citizen", "official", "admin" |

#### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR | Full name |
| email | VARCHAR UNIQUE | Login email |
| password | VARCHAR | bcrypt hash |
| roleId | INT FK → roles.id | |
| wardNo | VARCHAR | Ward number (citizens only) |

#### `complaints`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| trackingId | VARCHAR UNIQUE | e.g., COMP-1740000000-123 |
| title | VARCHAR | Short title |
| description | TEXT | Full description |
| geoTag | JSON | `{ lat, lng }` |
| status | ENUM | Open / In Progress / Resolved / Closed |
| priority | ENUM | Low / Medium / High / Critical |
| wardNo | VARCHAR | Complaint ward |
| citizenId | INT FK → users.id | Who submitted |
| officialId | INT FK → users.id | Who is handling |
| assignedStaff | VARCHAR | Field worker name/contact |
| slaDeadline | DATETIME | 7 days from submission |
| isEscalated | BOOLEAN | Whether escalated |
| escalatedAt | DATETIME | When escalated |

#### `attachments`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | |
| url | VARCHAR | File path |
| filename | VARCHAR | |
| fileType | VARCHAR | MIME type |
| complaintId | INT FK → complaints.id | |

#### `histories`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | |
| event | VARCHAR | Hindi description of event |
| comment | TEXT | Optional comment |
| previousStatus | VARCHAR | Before status |
| newStatus | VARCHAR | After status |
| complaintId | INT FK → complaints.id | |
| performedById | INT FK → users.id | Who performed action |

### Entity Relationship
```
roles (1) ──── (N) users (1) ──── (N) complaints (1) ──── (N) attachments
                                         │
                                         └──────────────── (N) histories
```

---

## ⚙️ Installation <a name="installation"></a>

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm 9+

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/panchayat.git
cd panchayat

# 2. Install root dependencies
npm install

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Install frontend dependencies
cd frontend && npm install && cd ..

# 5. Configure environment
# Edit backend/.env with your MySQL credentials:
#   DB_NAME=panchayat
#   DB_USER=root
#   DB_PASSWORD=yourpassword
#   DB_HOST=localhost
#   DB_PORT=3306
#   JWT_SECRET=your_secret_key
#   DEFAULT_ADMIN_PASSWORD=admin1010#

# 6. Create the MySQL database (tables auto-created by Sequelize)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS panchayat;"

# 7. Start everything (backend + frontend + auto-seed)
npm run start-all
```

The app **auto-creates all tables** on first boot using `sequelize.sync({ alter: true })` and seeds the default admin user.

### Access
| URL | Description |
|-----|-------------|
| http://localhost:5173 | Frontend (React) |
| http://localhost:3000 | Backend API |

---

## 🔑 Default Credentials <a name="default-credentials"></a>

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@panchayat.gov.in | 123456 |
| Citizen | Register yourself | — |
| Official | Register with roleSlug: official | — |

---

## 📡 API Reference <a name="api-reference"></a>

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | — | Register new user |
| POST | `/api/v1/auth/login` | — | Login and get JWT |

### Complaints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/complaint/submit` | Citizen | Submit a complaint |
| GET | `/api/v1/complaint/track/:id` | — | Track by tracking ID |
| GET | `/api/v1/complaint/ward` | Official/Admin | Get ward complaints |
| PATCH | `/api/v1/complaint/:id/status` | Official/Admin | Update status |
| PATCH | `/api/v1/complaint/:id/assign` | Official/Admin | Assign field staff |
| PATCH | `/api/v1/complaint/:id/escalate` | Official/Admin | Escalate complaint |
| GET | `/api/v1/complaint/analytics` | Admin | Get system analytics |

---

## 📁 Folder Structure <a name="folder-structure"></a>

```
panchayat/
├── backend/
│   ├── bin/www.js            # Entry point (cluster mode)
│   ├── app.js                # Express app setup
│   ├── config/db.js          # Sequelize + auto-seed
│   ├── models/               # Sequelize models (Role, User, Complaint, History, Attachment)
│   ├── controllers/v1/       # Route handlers
│   ├── service/v1/           # Business logic layer
│   ├── routes/v1/            # Express routers
│   ├── middleware/           # auth.js, upload.js
│   └── .env                  # Environment variables
└── frontend/
    └── src/
        ├── pages/
        │   ├── Home/         # Landing page
        │   ├── Auth/         # Login, Register
        │   ├── Citizen/      # Citizen Dashboard
        │   ├── Official/     # Official Dashboard
        │   └── Admin/        # Admin Dashboard
        └── App.jsx           # Router setup
```

---

## 📜 License
MIT — For educational/submission purposes.
