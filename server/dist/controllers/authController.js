"use strict";
// import { Request, Response, NextFunction } from 'express'; // Add NextFunction
// import { OAuth2Client } from 'google-auth-library';
// import dotenv from 'dotenv';
Object.defineProperty(exports, "__esModule", { value: true });
// dotenv.config();
// // Initialize Google Auth Client
// const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// if (!CLIENT_ID) {
//   throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
// }
// const client = new OAuth2Client(CLIENT_ID);
// // Add explicit type for RequestHandler
// export async function breakupAuth(
//   req: Request,
//   res: Response,
//   next: NextFunction // Add next parameter (even if unused)
// ): Promise<void> { // Add explicit return type
//     console.log("HERE")
//   try {
//     const { token } = req.body;
//     if (!token) {
//       res.status(400).json({ error: 'Missing authentication token' });
//       return;
//     }
//     // Verify the Google token
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: CLIENT_ID,
//     });
//     const payload = ticket.getPayload();
//     if (!payload) {
//       res.status(401).json({ error: 'Invalid authentication token' });
//       return;
//     }
//     const userData = {
//       email: payload.email,
//       name: payload.name,
//       firstName: payload.given_name,
//       lastName: payload.family_name,
//       picture: payload.picture,
//     };
//     res.json({
//       success: true,
//       user: userData,
//     });
//   } catch (error) {
//     console.error('Google authentication error:', error);
//     res.status(500).json({
//       error: 'Authentication failed',
//       details: error instanceof Error ? error.message : 'Unknown error',
//     });
//   }
// }
//# sourceMappingURL=authController.js.map