const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const { google } = require('googleapis');
const destroyDestroyer = require('server-destroy');

const KEY_PATH = path.join(__dirname, 'client_secret.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

async function main() {
    let keys = { redirect_uris: [''] };
    if (fs.existsSync(KEY_PATH)) {
        keys = require(KEY_PATH).installed;
    } else {
        console.error('client_secret.json not found!');
        process.exit(1);
    }

    // Try a port that is likely to be free. backend is 5000.
    // If the configured redirect_uri is literally "http://localhost", it implies port 80 or we can append a port.
    // Google Desktop App clients typically allow dynamic ports on localhost.
    const port = 5001;
    const invalidRedirectUri = `http://localhost:${port}/oauth2callback`;

    const oauth2Client = new google.auth.OAuth2(
        keys.client_id,
        keys.client_secret,
        invalidRedirectUri
    );

    const scopes = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets'
    ];

    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'  // Force refresh token generation
    });

    const server = http
        .createServer(async (req, res) => {
            try {
                if (req.url.indexOf('/oauth2callback') > -1) {
                    const qs = new url.URL(req.url, 'http://localhost:5001').searchParams;
                    res.end('Authentication successful! Please return to the console.');
                    server.destroy();
                    const { tokens } = await oauth2Client.getToken(qs.get('code'));
                    oauth2Client.setCredentials(tokens);

                    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
                    console.log('Token stored to', TOKEN_PATH);
                    console.log('You can now close this script/window if it doesn\'t close automatically.');
                    process.exit(0);
                }
            } catch (e) {
                console.error(e);
                res.end('Error during authentication');
                server.destroy();
                process.exit(1);
            }
        })
        .listen(port, () => {
            console.log(`\n\n--- ACTION REQUIRED ---\n\nOpen the following URL in your browser:\n\n${authorizeUrl}\n\n`);
        });

    destroyDestroyer(server);
}

main().catch(console.error);
