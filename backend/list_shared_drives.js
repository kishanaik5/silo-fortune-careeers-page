const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

async function listSharedDrives() {
    try {
        const res = await drive.drives.list({
            pageSize: 10,
        });
        const drives = res.data.drives;
        if (drives.length === 0) {
            console.log('No Shared Drives found.');
        } else {
            console.log('Shared Drives found:');
            drives.forEach((d) => {
                console.log(`${d.name} (${d.id})`);
            });
        }
    } catch (err) {
        console.error('Error listing Shared Drives:', err.message);
    }
}

listSharedDrives();
