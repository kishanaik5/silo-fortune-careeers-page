const { pool } = require('./db');

const checkExperience = async () => {
    try {
        const res = await pool.query('SELECT DISTINCT experience FROM jobs');
        console.log('Distinct Experience Levels:', res.rows.map(r => r.experience));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkExperience();
