const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const CREDENTIALS_PATH = path.join(__dirname, '../client_secret.json');
const TOKEN_PATH = path.join(__dirname, '../token.json');

// Initialize Google Auth using OAuth2 User Credentials
let auth;
try {
    const content = fs.readFileSync(CREDENTIALS_PATH);
    const keys = JSON.parse(content).installed;
    const client = new google.auth.OAuth2(
        keys.client_id,
        keys.client_secret,
        keys.redirect_uris[0]
    );

    if (fs.existsSync(TOKEN_PATH)) {
        const token = fs.readFileSync(TOKEN_PATH);
        client.setCredentials(JSON.parse(token));
        auth = client;
        console.log('Loaded OAuth2 User Credentials');
    } else {
        console.error('token.json not found! Run setup_oauth.js first.');
    }
} catch (error) {
    console.error('Error loading OAuth2 credentials:', error.message);
}

const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth });

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

/**
 * Append a new application to the Google Sheet
 */
async function appendApplication(data) {
    try {
        const resource = {
            values: [[
                data.id,
                data.name,
                data.email,
                data.phone,
                data.role,
                data.location,
                data.degree,
                data.linkedin,
                data.address,
                data.resumeLink, // Link to file in Drive
                data.status || 'Pending', // Current status
                new Date().toISOString()
            ]],
        };

        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: 'Sheet1!A:L', // Adjust range if needed
            valueInputOption: 'USER_ENTERED',
            resource,
        });
        console.log('Application appended to sheet');
    } catch (error) {
        console.error('Error appending to sheet:', error);
        throw error;
    }
}

/**
 * Upload a file to Google Drive
 */
async function uploadFile(file, fileName, folderId = DRIVE_FOLDER_ID) {
    try {
        const fileMetadata = {
            name: `${fileName}${path.extname(file.originalname)}`,
            parents: [folderId],
        };
        const media = {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.path),
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
        });

        // Set permissions to be viewable by anyone with link
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        return response.data.webViewLink;
    } catch (error) {
        console.error('Error uploading to Drive:', error);
        throw error;
    }
}

/**
 * Update application status in Google Sheet
 */
async function updateApplicationStatus(id, newStatus) {
    try {
        // 1. Find the row number by searching for the ID in Column A
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: 'Sheet1!A:A', // Fetch only the ID column
        });

        const rows = result.data.values;
        if (!rows || rows.length === 0) {
            console.log('No data found in sheet');
            return;
        }

        // Find index of the ID
        // Note: rows indices are 0-based. Row 1 in sheet is index 0.
        // We assume ID is unique.
        const rowIndex = rows.findIndex(row => row[0] == id);

        if (rowIndex === -1) {
            console.log(`Application ID ${id} not found in Google Sheet`);
            return;
        }

        // Sheet row number is index + 1
        const sheetRowNumber = rowIndex + 1;

        // 2. Update the Status cell (Column G)
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `Sheet1!G${sheetRowNumber}`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[newStatus]]
            }
        });

        console.log(`Updated status for ID ${id} to ${newStatus} in Google Sheet (Row ${sheetRowNumber})`);

    } catch (error) {
        console.error('Error updating status in sheet:', error);
        // Don't throw, so we don't block the main response
    }
}

module.exports = { appendApplication, uploadFile, updateApplicationStatus };
