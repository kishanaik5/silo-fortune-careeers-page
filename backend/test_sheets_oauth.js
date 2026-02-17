require('dotenv').config();
const { appendApplication } = require('./services/googleService');

const mockData = {
    id: 'test-id-' + Date.now(),
    name: 'Test OAuth User',
    email: 'test@example.com',
    phone: '1234567890',
    role: 'Test Role',
    resumeLink: 'http://example.com/resume',
    status: 'Pending'
};

async function test() {
    try {
        console.log('Starting Sheets append test...');
        await appendApplication(mockData);
        console.log('Append successful!');
    } catch (error) {
        console.error('Append failed!');
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

test();
