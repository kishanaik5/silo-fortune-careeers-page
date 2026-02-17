const { uploadResume } = require('./services/googleService');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Mock file object
const dummyPath = path.join(__dirname, 'test_oauth_upload.txt');
fs.writeFileSync(dummyPath, 'This is a test upload using OAuth credentials.');

const mockFile = {
    path: dummyPath,
    originalname: 'Test_OAuth_Upload.txt',
    mimetype: 'text/plain',
};

async function test() {
    try {
        console.log('Starting upload test...');
        const link = await uploadResume(mockFile, 'TestUser');
        console.log('Upload successful!');
        console.log('Link:', link);
    } catch (error) {
        console.error('Upload failed:', error);
    } finally {
        if (fs.existsSync(dummyPath)) {
            fs.unlinkSync(dummyPath);
        }
    }
}

test();
