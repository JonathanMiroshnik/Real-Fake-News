"use strict";
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
// import { Admin } from '../models/Admin';
// import { Request, Response } from 'express';
// export const loginAdmin = async (req: Request, res: Response) => {
//   try {
//     const { username, password } = req.body;
//     const admin = await Admin.findOne({ username });
//     if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
//     const validPassword = await bcrypt.compare(password, admin.password);
//     if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
//     const token = jwt.sign(
//       { adminId: admin._id, role: admin.role },
//       process.env.JWT_SECRET!,
//       { expiresIn: '1h' }
//     );
//     res.cookie('adminToken', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 3600000 // 1 hour
//     });
//     res.json({ success: true });
//   } catch (error) {
//     res.status(500).json({ error: 'Login failed' });
//   }
// };
//# sourceMappingURL=adminController.js.map