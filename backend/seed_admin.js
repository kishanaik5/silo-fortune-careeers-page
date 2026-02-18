const { pool } = require('./db');

const admins = [
    { name: 'Admin User', email: 'admin@silofortune.com', password: 'admin123' },
    { name: 'Admin One', email: 'admin1@silofortune.com', password: 'admin123' },
    { name: 'Admin Two', email: 'admin2@silofortune.com', password: 'admin123' }
];

async function seedAdmins() {
    try {
        console.log('Seeding admins...');
        for (const admin of admins) {
            const res = await pool.query('SELECT * FROM admins WHERE email = $1', [admin.email]);
            if (res.rows.length === 0) {
                await pool.query('INSERT INTO admins (name, email, password) VALUES ($1, $2, $3)', [admin.name, admin.email, admin.password]);
                console.log(`Created: ${admin.email} / ${admin.password}`);
            } else {
                console.log(`Already exists: ${admin.email}`);
            }
        }
    } catch (err) {
        console.error('Error seeding admins:', err);
    } finally {
        pool.end();
    }
}

seedAdmins();
