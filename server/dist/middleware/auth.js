"use strict";
// // Backend middleware
// import jwt from 'jsonwebtoken';
Object.defineProperty(exports, "__esModule", { value: true });
// export const authenticate = (req: Request, res: Response, next: NextFunction) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'Unauthorized' });
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ error: 'Invalid token' });
//   }
// };
// // Usage in routes
// router.post('/chat/send', authenticate, checkTimeAllowance, chatController.send);
//# sourceMappingURL=auth.js.map