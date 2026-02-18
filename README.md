# Silo Fortune Careers - Master Setup & User Guide

Welcome to the **Silo Fortune Careers** project! This is a full-stack application comprising:
1. **Backend API**: Node.js/Express server connecting to PostgreSQL, Google Sheets, Google Drive, and Gmail.
2. **Admin Portal**: React application for HR/Admins to manage jobs and view applications. (`http://localhost:3001`)
3. **Jobs Portal**: React application for candidates to view jobs and apply. (`http://localhost:3000`)

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

### Admin Portal (http://localhost:3001)

**Login Credentials:**
| Account | Email | Password |
|---------|-------|----------|
| Admin 1 | admin@silofortune.com | admin123 |
| Admin 2 | admin1@silofortune.com | admin123 |
| Admin 3 | admin2@silofortune.com | admin123 |

**Dashboard:**
- Click **"Total Applications"** card to jump directly to Job Applications.
- Quick Actions cards navigate to all management sections.

**Manage Jobs:**
- Add new job roles — **Posted Date** and **Job ID** are auto-filled in the description.
- Edit or remove existing job listings.

**Job Applications:**
- View applicants grouped by job role.
- Shortlist/Reject candidates (sends automated email).
- Export applicant data to Excel.

**Evaluation Sheet:**
- Track Technical, HR, and FTA round scores for shortlisted candidates.
- Mark candidates as Selected or Rejected.

**Selected Candidates:**
- View selected candidates and open Gmail pre-filled with their email for offer letters.

**Event Registrations:**
- View registrations grouped by event with candidate count.
- Drill down to see individual registrant details.

**Manage Events:**
- Create new events with ticket limits and pricing.

---

### Jobs Portal (http://localhost:3000)

**Job Search:**
- Search by job title (case-insensitive, space-tolerant).
- Filter by Job Type and Experience Level.

**Applying for a Job:**
1. Click **"Apply Now"** on any job card.
2. If logged in, skip OTP and go directly to the form (with duplicate check).
3. If not logged in, verify via Email OTP.
4. Fill in the multi-step form:
   - **Personal**: Name, Gender, Phone, Address, Pincode.
   - **Professional**: Qualification, Experience, Salary, Joining Date.
   - **Portfolio**: LinkedIn, GitHub, Portfolio URL, Tech Stack.
   - **Documents**: Resume (required), Cover Letter (optional).
5. Submit — data is saved to PostgreSQL, Google Sheets, and Drive.

**Events:**
- View upcoming events with date, location, and price (or "Free").
- Register for events directly from the portal.

---

## ❓ Troubleshooting

| Error | Fix |
|-------|-----|
| `relation 'jobs' does not exist` | Restart the backend — it auto-creates tables on startup. |
| `GoogleAuth is not defined` | Ensure `credentials.json` is in the `backend/` folder. |
| `Postgres Connection Refused` | Check your password in `.env` and ensure PostgreSQL is running. |
| `Network Error` on frontend | Ensure the backend server is running on port 5000. |
| `Already Applied` notification | This is informational (blue) — the candidate has already applied for this role. |

---

## 📦 Repository

- **GitHub**: [kishanaik5/silo-fortune-careeers-page](https://github.com/kishanaik5/silo-fortune-careeers-page)
- **Branches**:
  - `main` — Primary stable branch
  - `ravikumar` — Development branch

---

## 📋 Recent Updates

### v4.0 — UI Refinements & Admin Enhancements
- **Admin Logo**: Replaced "SILO" text in Admin Portal header with the Silo Fortune logo.
- **Autofill Job Data**: "Posted Date" and "Job ID" are now auto-filled in the job description when adding a new role.
- **Clickable Stats**: "Total Applications" card on the dashboard now navigates to Job Applications.
- **Event Pricing**: Events now correctly display "Free" (without ₹ symbol) for free events, and `₹Price` for paid events on both `/events` and `/events/all`.
- **Price on All Events**: Added price display to the `/events/all` page.

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
- **SEO-Friendly URLs**: Job URLs use `/Title/Department/Type` format.
- **Admin Workflow**: Evaluation Sheet, Selected Candidates, and Final Call sections added.
- **Event Registrations**: Admin can view registrations grouped by event.

---

**You are all set! Happy coding! 🚀**
