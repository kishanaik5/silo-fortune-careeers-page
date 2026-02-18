const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const IMPERSONATE_EMAIL = 'ravikumar@silofortune.com';

const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
    clientOptions: {
        subject: IMPERSONATE_EMAIL,
    },
});

const drive = google.drive({ version: 'v3', auth });

async function checkImpersonation() {
    try {
        console.log(`Attempting to impersonate ${IMPERSONATE_EMAIL}...`);
        const res = await drive.about.get({
            fields: 'user, storageQuota',
        });

        console.log('Impersonation Successful!');
        console.log('User:', res.data.user.emailAddress);
        console.log('Quota Limit:', res.data.storageQuota.limit);
        console.log('Quota Usage:', res.data.storageQuota.usage);

    } catch (err) {
        console.error('Impersonation Failed:', err.message);
    }
}

checkImpersonation();
