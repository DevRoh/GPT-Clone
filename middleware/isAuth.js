import jwt from 'jsonwebtoken'
import User from '../model/userSchema.js';

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};