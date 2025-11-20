// src/middleware/role.js
import User from "../models/User.js";

export function checkRole(...roles) {
  return async function (req, res, next) {
    try {
      if (!req.userId) return res.status(401).json({ message: "Missing user" });
      const user = await User.findById(req.userId).lean();
      if (!user) return res.status(401).json({ message: "User not found" });
      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.userRole = user.role;
      next();
    } catch (err) {
      next(err);
    }
  };
}
