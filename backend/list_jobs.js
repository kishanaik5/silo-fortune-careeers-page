const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const listJobs = async () => {
    try {
        const res = await pool.query('SELECT id, title, department FROM jobs');
        res.rows.forEach(job => {
            console.log(`ID: ${job.id} | Title: ${job.title} | Dept: ${job.department}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};

listJobs();
