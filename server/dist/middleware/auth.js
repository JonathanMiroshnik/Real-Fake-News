"use strict";
// import { NextFunction } from "express";
// export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).send('Access denied');
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!);
//     req.admin = decoded;
//     next();
//   } catch (err) {
//     res.status(400).send('Invalid token');
//   }
// };
//# sourceMappingURL=auth.js.map