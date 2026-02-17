const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

async function checkQuota() {
    try {
        const res = await drive.about.get({
            fields: 'storageQuota',
        });
        const quota = res.data.storageQuota;
        const output = `Storage Quota:
Limit: ${quota.limit} bytes (${(quota.limit / 1024 / 1024 / 1024).toFixed(2)} GB)
Usage: ${quota.usage} bytes (${(quota.usage / 1024 / 1024 / 1024).toFixed(2)} GB)
Usage in Drive: ${quota.usageInDrive} bytes
Usage in Trash: ${quota.usageInDriveTrash} bytes`;

        console.log(output);
        fs.writeFileSync('quota_result.txt', output);

    } catch (err) {
        console.error('Error checking quota:', err.message);
    }
}

checkQuota();
