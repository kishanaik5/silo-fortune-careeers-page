const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    console.log('Connected to the database');
});

// Create Tables Script
const createTables = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        location VARCHAR(255),
        type VARCHAR(50),
        description TEXT,
        requirements TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES jobs(id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        resume_link TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        is_verified BOOLEAN DEFAULT FALSE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
        email VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS otps (
        email VARCHAR(255) PRIMARY KEY,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(50),
        location VARCHAR(255),
        total_tickets INTEGER DEFAULT 0,
        price INTEGER DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS candidates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    try {
        await pool.query(queryText);

        // Add evaluation columns
        const alterQuery = `
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS technical_round VARCHAR(255);
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS hr_round VARCHAR(255);
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS fta_round VARCHAR(255);
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS location VARCHAR(255);
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS degree VARCHAR(255);
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS linkedin TEXT;
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS address TEXT;
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
            
            -- New Columns for Enhanced Application Flow
            ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience VARCHAR(100);
            ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category VARCHAR(50); -- Added Category

            ALTER TABLE applications ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS portfolio TEXT;
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS tech_stack TEXT;
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS cover_letter TEXT;
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS applicant_experience VARCHAR(100);
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS projects_github TEXT;
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS current_salary VARCHAR(100);
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS expected_salary VARCHAR(100);
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS joining_date VARCHAR(100);
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS qualification VARCHAR(255);
            ALTER TABLE applications ADD COLUMN IF NOT EXISTS pincode VARCHAR(20); -- Added Pincode

            CREATE TABLE IF NOT EXISTS event_registrations (
                id SERIAL PRIMARY KEY,
                event_id INTEGER NOT NULL,
                event_title VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                ticket_count INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            ALTER TABLE events ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0;
        `;
        await pool.query(alterQuery);

        console.log('Tables created/updated successfully');
    } catch (err) {
        console.log('Error creating tables:', err);
    }
};

module.exports = { pool, createTables };
