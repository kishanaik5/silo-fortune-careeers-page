# Silo Fortune Careers — Master Setup & User Guide

Welcome to the **Silo Fortune Careers** project! This is a full-stack web application comprising:

1. **Backend API** — Node.js/Express server connected to PostgreSQL, Google Sheets, Google Drive, and Gmail.
2. **Admin Portal** — React app for HR/Admins to manage jobs, events, and applications. (`http://localhost:3001`)
3. **Jobs Portal** — React app for candidates to browse jobs, apply, and register for events. (`http://localhost:3000`)

---

## 🛠️ Part 1: Prerequisites & Installation

Ensure you have these installed before proceeding:

1. **Node.js (LTS Version)** — [nodejs.org](https://nodejs.org/) — Verify: `node -v`
2. **PostgreSQL** — [postgresql.org](https://www.postgresql.org/download/) — Ensure service is running.
3. **Code Editor** — Recommended: [Visual Studio Code](https://code.visualstudio.com/)

---

## ☁️ Part 2: Google Cloud Setup

This application uses Google services to store resumes and track applications.

### Step 2.1: Create a Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Click project dropdown > **New Project** > Name: `silo-careers` > **Create**.

### Step 2.2: Enable APIs
1. Go to **APIs & Services** > **Library**.
2. Enable **Google Sheets API** and **Google Drive API**.

### Step 2.3: Create Service Account & Key
1. Go to **APIs & Services** > **Credentials** > **+ CREATE CREDENTIALS** > **Service Account**.
2. Name: `silo-app` > **Create** > Role: **Basic > Editor** > **Done**.
3. Click the service account email > **KEYS** tab > **ADD KEY** > **JSON**.
4. Rename the downloaded file to `credentials.json` and place it in the `backend/` folder.

### Step 2.4: Setup Google Drive & Sheets
1. Create a Google Drive folder named **"Silo Resumes"** and share it with the service account email.
2. Copy the folder ID from the URL (the long string after `/folders/`). This is your `GOOGLE_DRIVE_FOLDER_ID`.
3. Create a Google Sheet named **"Silo Applications"**, share it with the service account email.
4. Copy the sheet ID from the URL (the string between `/d/` and `/edit`). This is your `GOOGLE_SHEET_ID`.

---

## ⚙️ Part 3: Backend Configuration

1. Navigate to the `backend/` folder.
2. Create a file named `.env` and fill in your details:

```env
PORT=5000
DATABASE_URL=postgres://postgres:your_password@localhost:5432/silo_careers
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GOOGLE_SHEET_ID=paste_your_sheet_id_here
GOOGLE_DRIVE_FOLDER_ID=paste_your_folder_id_here
```

> **Note:** For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your login password.

3. **Create Database**:
   - Run: `psql -U postgres`
   - Run: `CREATE DATABASE silo_careers;`
   - Type `\q` to exit.

> The backend auto-creates all required tables (`jobs`, `applications`, `events`, `event_registrations`, `users`) on first startup.

---

## 🚀 Part 4: Running the Application

Open **3 separate terminal windows**:

### Terminal 1: Backend Server
```bash
cd "c:/Documents/Silo Fortune Web App/Careers/backend"
npm install
npm start
```
*Success: "Server running on port 5000" & "Connected to the database"*

### Terminal 2: Admin Portal
```bash
cd "c:/Documents/Silo Fortune Web App/Careers/admin-portal"
npm install
npm start
```
*Opens: http://localhost:3001*

### Terminal 3: Jobs Portal
```bash
cd "c:/Documents/Silo Fortune Web App/Careers/jobs-portal"
npm install
npm start
```
*Opens: http://localhost:3000*

---

## 📖 Part 5: User Manual

---

### 🔐 Admin Portal (`http://localhost:3001`)

**Login Credentials:**
| Account | Email | Password |
|---------|-------|----------|
| Admin 1 | admin@silofortune.com | admin123 |
| Admin 2 | admin1@silofortune.com | admin123 |
| Admin 3 | admin2@silofortune.com | admin123 |

---

#### 📊 Dashboard (`/admin-dashboard`)

The central hub showing live stats and quick actions.

**Stats Cards (all clickable):**
| Card | Navigates To | Shows |
|------|-------------|-------|
| Total Applications | `/admin-job-roles` | All applicants by role |
| Pending Review | `/admin-pending-review` | Pending applicants by role |
| Shortlisted | `/admin-shortlisted-review` | Shortlisted candidates by role |
| Rejected | — | Count only |

**Implementation:** Stats are computed from the `/api/applications` endpoint on mount. Each card with a `link` property uses `navigate(link)` via React Router on click, with a `cursor-pointer` and `hover:scale` effect to indicate interactivity.

**Quick Actions:**
- **Manage Jobs** → `/admin-manage-jobs`
- **Job Applications** → `/admin-job-roles`
- **Evaluation Sheet** → `/admin-evaluation`
- **Selected Candidates** → `/admin-selected-candidates`
- **Manage Events** → `/admin-manage-events`
- **Event Registrations** → `/admin-event-registrations`

---

#### 💼 Job Applications / Job Roles (`/admin-job-roles`)

View all applicants grouped by job role.

**Features:**
- Roles displayed as cards showing applicant count.
- Click a role card to drill into a table of all applicants for that role.
- **Shortlist** (✓) or **Reject** (✗) candidates — triggers an automated status-update email.
- **Download CSV** per role with all applicant details.
- **Auto-select from Dashboard**: When navigated from the Pending Review or Shortlisted pages via the "View →" button, the relevant role is automatically pre-selected and expanded.

**Implementation:** Uses `useLocation` to read `location.state.role` on mount. If a role is passed via router state, `setSelectedRole(role)` is called automatically.

---

#### ⏳ Pending Review (`/admin-pending-review`)

Dedicated page showing only `Pending` status applications.

**Features:**
- Summary banner: total pending count + number of job roles affected.
- Applications grouped by job role with expandable accordion rows.
- Each row shows: **Name**, **Contact** (email + phone), **Applied On**.
- **"View →"** button navigates to `/admin-job-roles` with that role pre-selected.

**Implementation:** Fetches `/api/applications`, filters `status === 'Pending'`, groups by `job_title` using `Array.reduce`. Navigation passes `{ state: { role: app.job_title } }` to Job Roles page.

---

#### ✅ Shortlisted Candidates Review (`/admin-shortlisted-review`)

Dedicated page showing only `Shortlisted` status applications.

**Features:**
- Summary banner: total shortlisted count + number of job roles affected.
- Applications grouped by job role with expandable accordion rows (green theme).
- Each row shows: **Name**, **Contact** (email + phone), **Applied On**.
- **"View →"** button navigates to `/admin-job-roles` with that role pre-selected.

**Implementation:** Same pattern as Pending Review — filters `status === 'Shortlisted'`, groups by `job_title`.

---

#### 📝 Evaluation Sheet (`/admin-evaluation`)

Track interview round scores for shortlisted candidates.

**Features:**
- Lists all shortlisted candidates.
- Input fields for **Technical**, **HR**, and **FTA** round scores.
- Mark candidates as **Selected** or **Rejected** after evaluation.
- Scores are saved and persist across sessions.

---

#### 🏆 Selected Candidates (`/admin-selected-candidates`)

View all candidates marked as **Selected** after evaluation.

**Features:**
- Displays candidate name, role, contact details.
- **Open Gmail** button pre-fills a Gmail compose window with the candidate's email for sending offer letters.

---

#### 📅 Event Registrations (`/admin-event-registrations`)

View event registrations in a two-level drill-down view.

**Features:**
- **Level 1**: Summary of all events with registration count per event.
- **Level 2**: Click an event to see a detailed table of all registered candidates (Name, Email, Phone, Tickets, Registration Date). The ID column is hidden.

---

#### 🗓️ Manage Events (`/admin-manage-events`)

Create and manage events shown on the Jobs Portal.

**Features:**
- Add new events with: Title, Description, Date, Location, Ticket Limit, Price.
- Edit or delete existing events.
- Price `0` is displayed as **"Free"** on the portal.

---

#### 🗂️ Manage Jobs (`/admin-manage-jobs`)

Create and manage job listings shown on the Jobs Portal.

**Features:**
- Add new job roles with title, department, type, experience, salary, description.
- **Auto-fill**: Posted Date and Job ID are automatically inserted into the description field.
- Edit or delete existing job listings.

---

#### 📤 Export Data (`/admin-export-data`)

Export applicant data to Excel/CSV for offline use.

---

### 👤 Jobs Portal (`http://localhost:3000`)

---

#### 🏠 Home (`/`)

Landing page with navigation to Jobs and Events sections.

---

#### 💼 Jobs (`/jobs`)

Browse all available job openings.

**Features:**
- **Search**: Case-insensitive, space-tolerant search by job title.
- **Filter**: By Job Type (Full-time, Part-time, Contract) and Experience Level.
- Each job card shows: Title, Department, Type, Experience, Salary, Location.
- Click **"Apply Now"** to start the application flow.

---

#### 📋 Apply for a Job (`/:title/:department/:type`)

Multi-step application form with OTP verification.

**Flow:**
1. **Job Details** — Review the job description.
2. **Login Check**:
   - If **logged in**: Skip OTP, check for duplicate application (shows blue notice if already applied), proceed directly to form.
   - If **not logged in**: Enter email → receive OTP → verify to proceed.
3. **Multi-Step Form**:
   - **Step 1 – Personal**: First Name, Last Name, Gender, Phone, Address, Pincode.
   - **Step 2 – Professional**: Qualification, Experience, Current Salary, Expected Salary, Joining Date.
   - **Step 3 – Portfolio**: LinkedIn, GitHub, Portfolio URL, Tech Stack.
   - **Step 4 – Documents**: Resume upload (required), Cover Letter (optional).
4. **Submit** — Data saved to PostgreSQL, Google Sheets, and Google Drive (resume).

**URL Format:** SEO-friendly URLs like `/Software-Engineer/Engineering/Full-time`.

**Implementation:** `ApplyJob.js` reads `title`, `department`, `type` from URL params via `useParams`. Job details are fetched from `/api/jobs` and matched. Auth state from `AuthContext` determines whether to show OTP or skip directly.

---

#### 🎉 Events (`/events`)

Main events page with featured events and success stories.

**Features:**
- Featured upcoming events with image, date, location, price (or "Free").
- **Register Now** button opens a modal registration form.
- Success stories section with expandable story modal.

**Registration Form Validation:**
- **Email**: Must end with `@gmail.com` — validated on submit with an alert.
- **Phone**: Digits only, exactly **10 digits** — input is restricted in real-time (non-digits stripped, max 10 characters).

---

#### 📆 All Events (`/events/all`)

Full paginated list of all events.

**Features:**
- Search events by title.
- Filter by category/type.
- Each event card shows: Date, Location, Price (`₹Amount` or **Free**).
- **Register Now** button opens the same registration modal.

**Registration Form** (identical to `/events`):
- **Price per ticket** displayed in the modal header.
- **Email**: Must end with `@gmail.com`.
- **Phone**: Digits only, exactly **10 digits**.
- Hint text: *"Only @gmail.com allowed"* shown below email field.

**Implementation:** Both `Events.js` and `AllEvents.js` use an inline `onChange` handler on the phone input: `val = e.target.value.replace(/\D/g, '')` with `val.length <= 10` guard. Submit handler validates email with `.endsWith('@gmail.com')` and phone digit count before calling the API.

---

#### 🔐 Candidate Login (`/login`)

Login page for returning candidates.

**Features:**
- Email + password login.
- Session stored in `AuthContext` (React Context API).
- Redirects to the job application flow after login.

---

#### 📰 All Stories (`/stories`)

Browse all published success stories and news articles.

---

## ❓ Troubleshooting

| Error | Fix |
|-------|-----|
| `relation 'jobs' does not exist` | Restart the backend — it auto-creates tables on startup. |
| `GoogleAuth is not defined` | Ensure `credentials.json` is in the `backend/` folder. |
| `Postgres Connection Refused` | Check your password in `.env` and ensure PostgreSQL is running. |
| `Network Error` on frontend | Ensure the backend server is running on port 5000. |
| `Already Applied` notification | This is informational (blue) — the candidate has already applied for this role. |
| Phone accepts more than 10 digits | Clear browser cache and hard-refresh (`Ctrl+Shift+R`). |

---

## 📦 Repository

- **GitHub**: [kishanaik5/silo-fortune-careeers-page](https://github.com/kishanaik5/silo-fortune-careeers-page)
- **Branches**:
  - `main` — Primary stable branch

---

## 📋 Changelog

### v5.0 — Dashboard Drill-Down & Validation
- **Pending Review Page**: New `/admin-pending-review` page — clicking the "Pending Review" dashboard card shows all pending applicants grouped by job role with a "View →" link to Job Roles.
- **Shortlisted Review Page**: New `/admin-shortlisted-review` page — clicking the "Shortlisted" dashboard card shows all shortlisted candidates grouped by job role.
- **Clickable Stats**: All dashboard stat cards (Total Applications, Pending Review, Shortlisted) are now clickable with pointer cursor and scale hover effect.
- **Auto-select Role**: Job Roles page auto-selects and expands the relevant role when navigated from Pending/Shortlisted pages.
- **Phone Validation**: Both `/events` and `/events/all` registration forms now restrict phone input to digits only (max 10), with submit-time validation.
- **Email Validation**: Both event registration forms validate that email ends with `@gmail.com`.
- **Consistent Registration Forms**: `/events/all` modal now matches `/events` exactly — shows price per ticket and "Only @gmail.com allowed" hint.

### v4.0 — UI Refinements & Admin Enhancements
- **Admin Logo**: Replaced "SILO" text in Admin Portal header with the Silo Fortune logo image.
- **Autofill Job Data**: "Posted Date" and "Job ID" are auto-filled in the job description when adding a new role.
- **Event Pricing**: Events display "Free" (without ₹ symbol) for free events, and `₹Price` for paid events on both `/events` and `/events/all`.
- **Price on All Events**: Added price display to the `/events/all` event cards.

### v3.2 — Application Flow & Search
- **Conditional Login**: Logged-in users skip OTP and go directly to the application form.
- **Duplicate Check**: Shows a blue "Notice" toast (not an error) if a candidate has already applied.
- **Cover Letter**: Made optional (no longer required for submission).
- **Search Accuracy**: Search now strictly matches job titles, with case-insensitive and space-tolerant matching.

### v3.1 — UX & Validation Overhaul
- **Custom Toast Notifications**: Modern glassy toast system for errors, success, and info messages.
- **Real-time Validation**: Immediate feedback on form submission errors.
- **Experience Validation**: Validates experience against job role requirements.

### v3.0 — Job Application Enhancements
- **Multi-Step Application Flow**: Job Details → OTP Verification → Comprehensive Form.
- **SEO-Friendly URLs**: Job URLs use `/:title/:department/:type` format.
- **Admin Workflow**: Evaluation Sheet, Selected Candidates, and Final Call sections added.
- **Event Registrations**: Admin can view registrations grouped by event with drill-down.

---

**You are all set! Happy coding! 🚀**
