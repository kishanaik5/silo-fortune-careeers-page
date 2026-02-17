# Silo Fortune Careers - Master Setup & User Guide

Welcome to the **Silo Fortune Careers** project! This is a full-stack application comprising:
1.  **Backend API**: Node.js/Express server connecting to PostgreSQL, Google Sheets, Google Drive, and Gmail.
2.  **Admin Portal**: React application for HR/Admins to manage jobs and view applications.
3.  **Jobs Portal**: React application for candidates to view jobs and apply.

This guide covers **everything** from installation to usage.

---

## 🛠️ Part 1: Prerequisites & Installation

Before writing any code or running commands, ensure you have these installed:

1.  **Node.js (LTS Version)**
    *   **Download**: [nodejs.org](https://nodejs.org/)
    *   **Verify**: Open a terminal and run `node -v`. It should print something like `v18.x.x`.

2.  **PostgreSQL (Database)**
    *   **Download**: [postgresql.org](https://www.postgresql.org/download/)
    *   **Verify**: Ensure the service is running. You can check by opening **pgAdmin** (included with the installer).
    *   **Default Credentials**: During install, you set a password for the `postgres` user. **Remember this password!**

3.  **Code Editor**
    *   **Recommended**: [Visual Studio Code](https://code.visualstudio.com/)

---

## ☁️ Part 2: Google Cloud Setup (Critical Step)

This application uses Google services to store resumes and track applications. You **must** set this up for the "Apply" button to work.

### Step 2.1: Create a Project
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Log in with your Google account.
3.  Click the project dropdown (top-left) > **New Project**.
4.  Name: `silo-careers` > **Create**.

### Step 2.2: Enable APIs
1.  Select your new project.
2.  Go to **APIs & Services** > **Library**.
3.  Search for **"Google Sheets API"** > Click **Enable**.
4.  Search for **"Google Drive API"** > Click **Enable**.

### Step 2.3: Create Service Account
1.  Go to **APIs & Services** > **Credentials**.
2.  Click **+ CREATE CREDENTIALS** > **Service Account**.
3.  Name: `silo-app` > **Create and Continue**.
4.  **Role**: Select **Basic** > **Editor** (This gives permission to read/write files).
5.  Click **Done**.

### Step 2.4: Generate Key File
1.  In the *Credentials* list, click on the email address of the service account you just created (e.g., `silo-app@project-id.iam.gserviceaccount.com`).
2.  Go to the **KEYS** tab (top bar).
3.  Click **ADD KEY** > **Create new key**.
4.  Select **JSON** > **Create**.
5.  A file will automatically download to your computer.
6.  **Rename** this file to `credentials.json`.
7.  **Move** this file into the `backend` folder of this project:
    *   Path: `.../Silo Fortune Web App/Careers/backend/credentials.json`

### Step 2.5: Setup Google Drive & Sheets
1.  **Copy the Service Account Email**: Go back to the Cloud Console and copy the email address (e.g., `silo-app@...`).
2.  **Google Drive Folder**:
    *   Go to your Google Drive.
    *   Create a folder named **"Silo Resumes"**.
    *   Right-click > **Share** > Paste the Service Account Email > **Send**.
    *   **Get ID**: Open the folder. The URL looks like `.../folders/1A2B3C...`. Copy the weird string `1A2B3C...`. This is your `GOOGLE_DRIVE_FOLDER_ID`.
3.  **Google Sheet**:
    *   Create a new Google Sheet named **"Silo Applications"**.
    *   **Share** > Paste the Service Account Email > **Send**.
    *   **Get ID**: The URL looks like `.../d/1XyZ123.../edit`. Copy the string `1XyZ123...`. This is your `GOOGLE_SHEET_ID`.

---

## ⚙️ Part 3: Backend Configuration

1.  Navigate to the `backend` folder.
2.  Create a file named `.env`.
3.  Paste the following content and **fill in your details**:

```env
# Server Port (Do not change)
PORT=5000

# Database Connection
# Replace 'your_password' with the password you set when installing PostgreSQL
DATABASE_URL=postgres://postgres:your_password@localhost:5432/silo_careers

# Email Settings (For Notifications)
# If using Gmail, you MUST use an "App Password", not your login password.
# Guide: https://support.google.com/accounts/answer/185833
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google IDs (From Step 2.5)
GOOGLE_SHEET_ID=paste_your_sheet_id_here
GOOGLE_DRIVE_FOLDER_ID=paste_your_folder_id_here
```

4.  **Create Database**:
    *   Open your terminal (PowerShell or Command Prompt).
    *   Run: `psql -U postgres` (Enter your password when prompted).
    *   Run: `CREATE DATABASE silo_careers;`
    *   Type `\q` to exit.
    *   *(Alternative: Use PgAdmin -> Right Click 'Databases' -> Create -> Name: silo_careers)*.

---

## 🚀 Part 4: Running the Application

You need to open **3 separate terminal windows** (or tabs) to run the full system.

### Terminal 1: Backend Server
```bash
cd "c:/Documents/Silo Fortune Web App/Careers/backend"
npm install
npm start
```
*Success Message: "Server running on port 5000" & "Connected to the database"*

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

### 1. Admin Portal (http://localhost:3001)
*   **Login**:
    *   You can use any of the following accounts:
        *   **Admin 1**: `admin@silofortune.com` / `admin123`
        *   **Admin 2**: `admin1@silofortune.com` / `admin123`
        *   **Admin 3**: `admin2@silofortune.com` / `admin123`
*   **Manage Jobs**:
    *   Click "Manage Job Roles".
    *   Fill in the form to add a new job (e.g., "Senior Developer", "Engineering", "Remote").
    *   The job instantly appears in the Jobs Portal.
*   **View Applications**:
    *   Go to "Export Data & View Applications".
    *   See a list of all applicants.
    *   **Shortlist/Reject**: Click the checkmark or X buttons. This will **send an email** to the applicant (if EMAIL details are set in `.env`).
    *   **View Resume**: Click "View File" to open the resume in Google Drive.
    *   **Export**: Click "Download CSV" to get a spreadsheet report.

### 2. Jobs Portal (http://localhost:3000)
*   **Home Page**: Shows all active jobs added by the Admin.
*   **Apply**:
    *   Click "Apply Now" on any job. The URL will change to `http://localhost:3000/Title/Department/Type` (e.g., `/Senior Developer/Engineering/Remote`).
    *   Fill in Name, Email, Phone.
    *   **Upload Resume**: Select a PDF/Doc file.
    *   Submit.
*   **Result**:
    *   Resume is saved to your "Silo Resumes" Drive folder.
    *   Data is added to your "Silo Applications" Google Sheet.
    *   Data is saved to the PostgreSQL database.
    *   Admin sees the new application immediately.

---

## ❓ Troubleshooting

*   **Error: "relation 'jobs' does not exist"**
    *   Restart the backend server. It automatically checks and creates tables on startup.
*   **Error: "GoogleAuth is not defined"**
    *   Ensure `credentials.json` is in the `backend` folder and not empty.
*   **Error: "Postgres Connection Refused"**
    *   Check if your password in `.env` is correct.
    *   Ensure PostgreSQL service is running in Windows Services.
*   **Frontend shows "Network Error"**
    *   Ensure the Backend Server (Terminal 1) is running and hasn't crashed.

---


---

## 📢 Recent Updates (v3.0) - Job Application Enhancements

### 1. Advanced Job Search & Formatting
- **Jobs Portal**: Added Search Bar and Filters for Job Type and Experience Level.
- **Job Cards**: Now display Experience requirement.
- **Design**: Enhanced UI with gradients and responsive layouts.

### 2. Multi-Step Application Flow
- **Step 1: Job Details**: Full job description view before applying.
- **Step 2: Verification**: Email OTP verification is now MANDATORY before accessing the application form.
- **Step 3: Comprehensive Form**:
    - **Personal**: First/Last Name, Gender, Phone, Address.
    - **Professional**: Qualification, Experience, Current/Expected Salary, Joining Date.
    - **Portfolio**: LinkedIn, GitHub, Portfolio URL, Tech Stack.
    - **Documents**: Resume and Cover Letter.
    - **Validation**: Strict mandatory field checks.

### 3. Backend & Database
- **Schema**: Added 12+ new columns to `applications` table for detailed applicant tracking.
- **Job Schema**: Added `experience` field to `jobs`.
- **Duplicate Check**: Prevents candidates from applying to the same job twice.
- **Emails**: Automated "Application Received" email with Job ID and Support contact.

---

---

## ✨ Recent Updates (v3.1) - UX & Validation Overhaul

### 1. Enhanced User Feedback
- **Custom Toast Notifications**: Replaced browser alerts with a modern, "glassy" red/green toast notification system in the top-right corner for errors and success messages.
- **Real-time Validation**: Immediate feedback on form submission errors.

### 2. Form Layout & Logic
- **Resume Upload**: Moved to a dedicated, high-visibility section at the top of the form.
- **Vertical Layout**: "Personal Details" section reorganized into a clean vertical stack for better readability.
- **Experience Validation**: "Total Experience" is now a numeric input that validates against the specific job role's requirement (e.g., checks if a "Senior" role applicant has >5 years).
- **New Fields**: Added **Pincode** to Personal Details.
- **File Inputs**: Cover Letter now accepts PDF uploads.

---

**You are all set! Happy coding!**
