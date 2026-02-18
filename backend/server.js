require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { pool, createTables } = require('./db');
const { uploadFile } = require('./services/googleService'); // Updated import
const { sendRejectionEmail, sendShortlistedEmail, sendSelectedEmail, sendOTPEmail } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 5000;
const COVER_LETTER_FOLDER_ID = '1trCjDyYR1_kYCMjD_OiY8Sv_89mWWYU2'; // Provided by User

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Tables
createTables();

// Configure local storage for temporary file uploads before sending to Drive
const upload = multer({ dest: 'uploads/' });

// --- ROUTES ---

// 0. ADMIN AUTH & OTP

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const admin = result.rows[0];
        // In production, use bcrypt.compare here
        if (admin.password !== password) return res.status(401).json({ error: 'Invalid credentials' });

        res.json({ message: 'Login successful', admin: { name: admin.name, email: admin.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Admin Register (Temporary/Internal use to create first admin)
app.post('/api/admin/register', async (req, res) => {
    const { email, name, password } = req.body;
    try {
        await pool.query('INSERT INTO admins (email, name, password) VALUES ($1, $2, $3)', [email, name, password]);
        res.json({ message: 'Admin created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating admin' });
    }
});

// Send OTP
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 mins

    try {
        await pool.query('INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET otp = $2, expires_at = $3', [email, otp, expiresAt]);
        await sendOTPEmail(email, otp);
        res.json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error sending OTP' });
    }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const result = await pool.query('SELECT * FROM otps WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(400).json({ error: 'No OTP found for this email' });

        const record = result.rows[0];
        if (new Date() > new Date(record.expires_at)) return res.status(400).json({ error: 'OTP expired' });
        if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

        // OTP Verified
        await pool.query('DELETE FROM otps WHERE email = $1', [email]);
        res.json({ message: 'OTP verified successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error verifying OTP' });
    }
});

// CANDIDATE AUTH
app.post('/api/candidate/send-otp', async (req, res) => {
    const { email } = req.body;
    // Strict Gmail Validation
    if (!email.endsWith('@gmail.com')) {
        return res.status(400).json({ error: 'Only @gmail.com addresses are allowed.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 mins

    try {
        await pool.query('INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET otp = $2, expires_at = $3', [email, otp, expiresAt]);
        await sendOTPEmail(email, otp);
        res.json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error sending OTP' });
    }
});

app.post('/api/candidate/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const result = await pool.query('SELECT * FROM otps WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(400).json({ error: 'No OTP found' });

        const record = result.rows[0];
        if (new Date() > new Date(record.expires_at)) return res.status(400).json({ error: 'OTP expired' });
        if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

        // Create or Get Candidate
        let candidateRes = await pool.query('SELECT * FROM candidates WHERE email = $1', [email]);
        if (candidateRes.rows.length === 0) {
            candidateRes = await pool.query('INSERT INTO candidates (email) VALUES ($1) RETURNING *', [email]);
        }

        await pool.query('DELETE FROM otps WHERE email = $1', [email]);
        res.json({ message: 'Login successful', candidate: candidateRes.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error verifying OTP' });
    }
});


// 1. GET ALL JOBS
app.get('/api/jobs', async (req, res) => {
    const { search, type, experience, category } = req.query; // Added category
    try {
        let queryText = 'SELECT * FROM jobs';
        const queryParams = [];
        const conditions = [];

        if (search) {
            // Remove spaces from the search query for tolerance
            const normalizedSearch = search.replace(/\s+/g, '');
            queryParams.push(`%${normalizedSearch}%`);

            conditions.push(`(
                REPLACE(title, ' ', '') ILIKE $${queryParams.length}
            )`);
        }

        if (type && type !== 'All') {
            queryParams.push(type);
            conditions.push(`type = $${queryParams.length}`);
        }

        if (experience && experience !== 'All') {
            queryParams.push(experience);
            conditions.push(`experience = $${queryParams.length}`);
        }

        if (category && category !== 'All') { // Added category filter
            queryParams.push(category);
            conditions.push(`category = $${queryParams.length}`);
        }

        if (conditions.length > 0) {
            queryText += ' WHERE ' + conditions.join(' AND ');
        }

        queryText += ' ORDER BY created_at DESC';

        const result = await pool.query(queryText, queryParams);
        res.set('Cache-Control', 'no-store');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching jobs' });
    }
});

// 2. ADD A JOB (Admin)
app.post('/api/jobs', async (req, res) => {
    const { title, department, location, type, description, requirements, experience, category } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO jobs (title, department, location, type, description, requirements, experience, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [title, department, location, type, description, requirements, experience, category]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error adding job' });
    }
});

// 2.5 EDIT A JOB (Admin)
app.put('/api/jobs/:id', async (req, res) => {
    const { id } = req.params;
    const { title, department, location, type, description, requirements, experience, category } = req.body;
    try {
        const result = await pool.query(
            'UPDATE jobs SET title=$1, department=$2, location=$3, type=$4, description=$5, requirements=$6, experience=$7, category=$8 WHERE id=$9 RETURNING *',
            [title, department, location, type, description, requirements, experience, category, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating job' });
    }
});

// 3. DELETE A JOB (Admin)
app.delete('/api/jobs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
        res.json({ message: 'Job deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting job' });
    }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CHECK EXISTING APPLICATION
app.post('/api/check-application', async (req, res) => {
    const { email, jobId } = req.body;
    try {
        const result = await pool.query('SELECT * FROM applications WHERE email = $1 AND job_id = $2', [email, jobId]);
        if (result.rows.length > 0) {
            return res.json({ exists: true });
        }
        res.json({ exists: false });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error checking application status' });
    }
});

// 4. SUBMIT APPLICATION
// Update multer to handle both resume and cover_letter
const applicationUpload = upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'cover_letter', maxCount: 1 }]);

app.post('/api/apply', applicationUpload, async (req, res) => {
    const {
        jobId,
        first_name,
        last_name,
        email,
        phone,
        location,
        qualification,
        linkedin,
        address,
        gender,
        portfolio,
        tech_stack,
        // cover_letter is now a file
        applicant_experience,
        projects_github,
        current_salary,
        expected_salary,
        joining_date,
        pincode // Added pincode
    } = req.body;

    const files = req.files;
    const resumeFile = files['resume'] ? files['resume'][0] : null;
    const coverLetterFile = files['cover_letter'] ? files['cover_letter'][0] : null;

    // MANDATORY FIELD VALIDATION
    if (!resumeFile) {
        return res.status(400).json({ error: 'Resume file is required' });
    }

    // Cover Letter is now a file, mandatory
    // Cover Letter is optional now
    // if (!coverLetterFile) {
    //     return res.status(400).json({ error: 'Cover Letter file is required' });
    // }

    const requiredFields = [
        'jobId', 'first_name', 'last_name', 'email', 'phone', 'location', 'pincode', // Added pincode
        'qualification', 'gender', // Removed address from mandatory for now if user wants to remove it, but plan said remove mandatory check. 
        // Keeping address in body but removing from required list if requested. 
        // User said: "Current Address -> Remove mandatory"
        // I will remove 'address' from requiredFields.
        // Also "Expected Salary -> Remove Mandatory" -> remove 'expected_salary'
        // "Expected joining -> remove mandatory" -> remove 'joining_date'
        'tech_stack', 'applicant_experience',
        'current_salary'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].trim() === '');

    if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const name = `${first_name} ${last_name}`; // Construct full name for backward compatibility

    // Check for duplicate application again (backend safety)
    try {
        const check = await pool.query('SELECT * FROM applications WHERE email = $1 AND job_id = $2', [email, jobId]);
        if (check.rows.length > 0) {
            return res.status(400).json({ error: 'You have already applied for this position.' });
        }
    } catch (err) {
        console.error('Error checking duplicate:', err);
        return res.status(500).json({ error: 'Server error checking application status' });
    }

    // Helper to process file (rename and upload)
    const processFile = async (file, type, targetFolderId = null) => {
        const originalExt = path.extname(file.originalname);
        const newFilename = `${file.filename}${originalExt}`;
        const newPath = path.join(file.destination, newFilename);

        try {
            const fs = require('fs');
            fs.renameSync(file.path, newPath);
            file.path = newPath;
            file.filename = newFilename;
        } catch (err) {
            console.error(`Error renaming ${type} file:`, err);
            throw new Error(`Failed to process ${type} file`);
        }

        let link = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

        try {
            // Updated to use uploadFile with targetFolderId
            // Name format: ApplicantName_Type_Timestamp
            const fileNameOnDrive = `${name}_${type}_${Date.now()}`;
            const driveLink = await uploadFile(file, fileNameOnDrive, targetFolderId || undefined);

            if (driveLink) {
                link = driveLink;
                // Delete local file if Drive upload succeeds
                const fs = require('fs');
                fs.unlink(file.path, (err) => {
                    if (err) console.error(`Failed to delete local ${type} file:`, err);
                });
            }
        } catch (driveErr) {
            console.error(`Google Drive Upload Failed for ${type}:`, driveErr.message);
        }
        return link;
    };

    let resumeLink = '';
    let coverLetterLink = '';

    try {
        resumeLink = await processFile(resumeFile, 'Resume'); // Uses default folder
        coverLetterLink = await processFile(coverLetterFile, 'CoverLetter', COVER_LETTER_FOLDER_ID); // Uses specific folder

        // 2. Save to PostgreSQL
        const queryText = `
            INSERT INTO applications (
                job_id, name, email, phone, resume_link, status, location, degree, linkedin, address,
                first_name, last_name, gender, portfolio, tech_stack, cover_letter, 
                applicant_experience, projects_github, current_salary, expected_salary, joining_date, qualification, pincode
            ) VALUES (
                $1, $2, $3, $4, $5, 'Pending', $6, $7, $8, $9,
                $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
            ) RETURNING *
        `;

        const values = [
            jobId, name, email, phone, resumeLink, location, qualification, linkedin, address,
            first_name, last_name, gender, portfolio, tech_stack, coverLetterLink, // Store link instead of text
            applicant_experience, projects_github, current_salary, expected_salary, joining_date, qualification, pincode
        ];

        const { sendRejectionEmail, sendShortlistedEmail, sendSelectedEmail, sendOTPEmail, sendApplicationReceivedEmail, sendEventRegistrationEmail } = require('./services/emailService');

        const dbResult = await pool.query(queryText, values);
        const application = dbResult.rows[0];

        // 3. Send Emails
        // To Applicant
        const jobTitle = req.body.role || 'the position'; // passed from frontend
        try {
            await sendApplicationReceivedEmail(email, name, jobTitle, jobId);
        } catch (emailErr) {
            console.error("Email error:", emailErr);
        }

        res.status(201).json({ message: 'Application submitted successfully', applicationId: application.id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error saving application' });
    }
});

// EVENT REGISTRATION
app.post('/api/register-event', async (req, res) => {
    const { event_id, event_title, name, email, phone, ticket_count } = req.body;

    if (!event_id || !name || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Save to DB
        await pool.query(
            'INSERT INTO event_registrations (event_id, event_title, name, email, phone, ticket_count) VALUES ($1, $2, $3, $4, $5, $6)',
            [event_id, event_title, name, email, phone, ticket_count || 1]
        );

        // Send Email
        const { sendEventRegistrationEmail } = require('./services/emailService');
        try {
            await sendEventRegistrationEmail(email, name, event_title, ticket_count || 1);
        } catch (emailErr) {
            console.error("Event Email error:", emailErr);
        }

        res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        console.error('Error registering for event:', err);
        res.status(500).json({ error: 'Server error registering for event' });
    }
});

// GET EVENT REGISTRATIONS (Admin)
app.get('/api/event-registrations', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM event_registrations ORDER BY created_at DESC');
        res.set('Cache-Control', 'no-store');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching event registrations' });
    }
});

// EVENT MANAGEMENT (Admin)
// Create Event
app.post('/api/events', async (req, res) => {
    const { title, date, location, total_tickets, price, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO events (title, date, location, total_tickets, price, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, date, location, total_tickets, price || 0, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).json({ error: 'Server error creating event' });
    }
});

// Get All Events with Ticket Stats
app.get('/api/events', async (req, res) => {
    try {
        const query = `
            SELECT e.*, 
            COALESCE(SUM(er.ticket_count), 0) as registered_count
            FROM events e
            LEFT JOIN event_registrations er ON e.id = er.event_id
            GROUP BY e.id
            ORDER BY e.created_at DESC
        `;
        const result = await pool.query(query);
        res.set('Cache-Control', 'no-store');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ error: 'Server error fetching events' });
    }
});

// Update Event
app.put('/api/events/:id', async (req, res) => {
    const { id } = req.params;
    const { title, date, location, total_tickets, price, description, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE events SET title=$1, date=$2, location=$3, total_tickets=$4, price=$5, description=$6, status=COALESCE($7, status) WHERE id=$8 RETURNING *',
            [title, date, location, total_tickets, price, description, status, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(500).json({ error: 'Server error updating event' });
    }
});

// Delete Event
app.delete('/api/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // First delete related registrations
        await pool.query('DELETE FROM event_registrations WHERE event_id = $1', [id]);
        // Then delete the event
        const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ error: 'Server error deleting event' });
    }
});

// 5. GET APPLICATIONS (Admin)
app.get('/api/applications', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, j.title as job_title, j.category as job_category
            FROM applications a 
            LEFT JOIN jobs j ON a.job_id = j.id 
            ORDER BY a.applied_at DESC
        `);
        res.set('Cache-Control', 'no-store');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching applications' });
    }
});

// 6.5. SEND EMAIL MANUALLY (Admin)
app.post('/api/applications/:id/email', async (req, res) => {
    const { id } = req.params;
    const { type, subject, body } = req.body;

    try {
        const result = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        const applicant = result.rows[0];

        // Fetch Job Title
        const jobResult = await pool.query('SELECT title FROM jobs WHERE id = $1', [applicant.job_id]);
        if (jobResult.rows.length > 0) {
            applicant.role = jobResult.rows[0].title;
        } else {
            applicant.role = 'the position';
        }

        if (type === 'selected') {
            await sendSelectedEmail(applicant, body, subject);
        }
        // Add other types if needed

        res.json({ message: 'Email sent successfully' });
    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).json({ error: 'Server error sending email' });
    }
});

// 6. UPDATE APPLICATION STATUS (Admin)
app.put('/api/applications/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'Shortlisted' or 'Rejected'

    try {
        const result = await pool.query(
            'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const applicant = result.rows[0];

        // Fetch Job Title for Email
        const jobResult = await pool.query('SELECT title FROM jobs WHERE id = $1', [applicant.job_id]);
        if (jobResult.rows.length > 0) {
            applicant.role = jobResult.rows[0].title;
        } else {
            applicant.role = 'the position'; // Fallback
        }

        // Send Email Notification
        if (status === 'Shortlisted') {
            await sendShortlistedEmail(applicant);
        } else if (status === 'Rejected') {
            await sendRejectionEmail(applicant);
        }
        // Note: 'Selected' status no longer triggers automatic email. 
        // Email is sent manually via /api/applications/:id/email endpoint.

        // Update Google Sheet Status - COMMENTED OUT
        // updateApplicationStatus(id, status);

        res.json({ message: `Application ${status}`, applicant });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating status' });
    }
});

// 7. UPDATE APP DETAILS (Rounds)
app.put('/api/applications/:id', async (req, res) => {
    const { id } = req.params;
    const { technical_round, hr_round, fta_round } = req.body;

    try {
        const result = await pool.query(
            'UPDATE applications SET technical_round = COALESCE($1, technical_round), hr_round = COALESCE($2, hr_round), fta_round = COALESCE($3, fta_round) WHERE id = $4 RETURNING *',
            [technical_round, hr_round, fta_round, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating details' });
    }
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
