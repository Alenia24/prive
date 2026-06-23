import jwt from "jsonwebtoken";
import User from "../models/user.js";

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isBlocked) {
      return res
        .status(403)
        .json({ success: false, message: "Account is blocked." });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }
}

export default protect;
