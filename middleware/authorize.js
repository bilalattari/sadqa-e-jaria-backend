import jwt from "jsonwebtoken";
import User from "../modals/Users.js"; // Replace with your user model

/**
 * @typedef {"user"| "department-hod"| "trustee"| "inquiry-officer"| "admin"} UserRoles
 */

/**
 *
 * @param {UserRoles[]} requiredRoles
 * @description Middleware function to check if the user has the required role
 */
const authorize = (requiredRoles) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from the Authorization header

    if (!token) {
      return res
        .status(401)
        .json({ error: true, msg: "Access denied. No token provided." });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach decoded user data to the request object

      // Fetch the user from the database to confirm the role
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found." });
      }

      // Check if the user's role is allowed
      if (!requiredRoles.includes(user.role)) {
        return res.status(403).json({
          error: true,
          msg: "Access denied. Insufficient permissions.",
        });
      }

      // Allow access
      next();
    } catch (err) {
      return res.status(401).json({ error: true, msg: "Invalid token." });
    }
  };
};

export default authorize;
