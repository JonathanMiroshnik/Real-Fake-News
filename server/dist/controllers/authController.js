"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.breakupAuth = breakupAuth;
const google_auth_library_1 = require("google-auth-library");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Initialize Google Auth Client
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!CLIENT_ID) {
    throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
}
const client = new google_auth_library_1.OAuth2Client(CLIENT_ID);
// Add explicit type for RequestHandler
async function breakupAuth(req, res, next // Add next parameter (even if unused)
) {
    console.log("HERE");
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ error: 'Missing authentication token' });
            return;
        }
        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            res.status(401).json({ error: 'Invalid authentication token' });
            return;
        }
        const userData = {
            email: payload.email,
            name: payload.name,
            firstName: payload.given_name,
            lastName: payload.family_name,
            picture: payload.picture,
        };
        res.json({
            success: true,
            user: userData,
        });
    }
    catch (error) {
        console.error('Google authentication error:', error);
        res.status(500).json({
            error: 'Authentication failed',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
//# sourceMappingURL=authController.js.map