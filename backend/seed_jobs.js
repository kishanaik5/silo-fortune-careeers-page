const { pool } = require('./db');

const jobsToSeed = [
    {
        title: 'MERN Stack Developer',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-time',
        category: 'Developers',
        description: 'We are looking for a skilled MERN Stack Developer to build and maintain our web applications.',
        requirements: 'Experience with MongoDB, Express, React, Node.js.',
        experience: 'Mid-Level',
    },
    {
        title: 'Test Engineer',
        department: 'Engineering',
        location: 'On-site',
        type: 'Full-time',
        category: 'Developers',
        description: 'Join our QA team to ensure the highest quality of our software products.',
        requirements: 'Manual and automated testing experience.',
        experience: 'Junior',
    },
    {
        title: 'Full Stack Developer',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-time',
        category: 'Developers',
        description: 'Looking for a versatile Full Stack Developer to work on end-to-end features.',
        requirements: 'Proficiency in frontend and backend technologies.',
        experience: 'Senior',
    },
    {
        title: 'Backend-Developer',
        department: 'Engineering',
        location: 'Bangalore',
        type: 'Full-time',
        category: 'Developers',
        description: 'Backend specialist needed for scalable system architecture.',
        requirements: 'Node.js, Python, Database interactions.',
        experience: 'Mid-Level',
    },
    {
        title: 'Frontend-Developer',
        department: 'Engineering',
        location: 'Remote',
        type: 'Contract',
        category: 'Developers',
        description: 'Create stunning user interfaces with modern frameworks.',
        requirements: 'React, Tailwind CSS, Responsive Design.',
        experience: 'Junior',
    }
];

const seedJobs = async () => {
    console.log('Seeding jobs...');
    try {
        for (const job of jobsToSeed) {
            // Check if job exists
            const check = await pool.query('SELECT * FROM jobs WHERE title = $1', [job.title]);
            if (check.rows.length === 0) {
                await pool.query(
                    'INSERT INTO jobs (title, department, location, type, description, requirements, experience, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                    [job.title, job.department, job.location, job.type, job.description, job.requirements, job.experience, job.category]
                );
                console.log(`Added: ${job.title}`);
            } else {
                console.log(`Skipped (Already exists): ${job.title}`);
            }
        }
        console.log('Seeding completed.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding jobs:', err);
        process.exit(1);
    }
};

seedJobs();
