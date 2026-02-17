const { pool } = require('./db');

const developerJobs = [
    'MERN Stack Developer',
    'Test Engineer',
    'Full Stack Developer',
    'Backend-Developer',
    'Frontend-Developer'
];

const updateJobs = async () => {
    console.log('Updating job categories...');
    try {
        for (const title of developerJobs) {
            const res = await pool.query(
                "UPDATE jobs SET category = 'Developers' WHERE title = $1 AND (category IS NULL OR category != 'Developers')",
                [title]
            );
            if (res.rowCount > 0) {
                console.log(`Updated category for: ${title}`);
            } else {
                console.log(`No update needed for: ${title}`);
            }
        }
        console.log('Update completed.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating jobs:', err);
        process.exit(1);
    }
};

updateJobs();
