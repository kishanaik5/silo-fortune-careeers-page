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

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

async function testUpload() {
    try {
        console.log(`Attempting to upload to folder ID: ${FOLDER_ID}`);

        // Create a dummy file
        const dummyPath = path.join(__dirname, 'test_upload.txt');
        fs.writeFileSync(dummyPath, 'This is a test upload file.');

        const fileMetadata = {
            name: 'Test_Upload_Root.txt',
            // parents: [FOLDER_ID], // Commented out to test root upload
        };
        const media = {
            mimeType: 'text/plain',
            body: fs.createReadStream(dummyPath),
        };

        const res = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, name, parents',
        });

        console.log(`Upload successful! File ID: ${res.data.id}`);
        console.log(`Parent Folder: ${res.data.parents ? res.data.parents[0] : 'Unknown'}`);

        // Clean up dummy file
        fs.unlinkSync(dummyPath);

    } catch (err) {
        console.error('Upload Failed:', err.message);
        if (err.response) {
            console.error('API Error Details:', JSON.stringify(err.response.data, null, 2));
        }
    }
}

testUpload();
