import express from "express";
import User from "../../modals/Users.js";
import jwt from "jsonwebtoken";
import authorize from "../../middleware/authorize.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { fullname, email, profileImage, platform, password } = req.body;

  if (!email || (!password && !platform)) {
    return res
      .status(400)
      .json({ error: true, msg: "Email and password/fullname are required." });
  }

  try {
    // Check if the user exists
    let user = await User.findOne({ email });

    // If the user is logging in with a password
    if (password && user) {
      // Verify the password
      const isMatch = password === user.password;
      if (!isMatch) {
        return res
          .status(400)
          .json({ error: true, msg: "Invalid credentials." });
      }

      // Update the last logged-in time
      user.lastLoggedIn = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return res.status(200).json({
        error: false,
        data: { user, token },
        msg: "Login successful.",
      });
    }

    // If the user is logging in without a password (social login or normal user)
    if (!user) {
      // Register the user

      user = new User({
        fullname,
        email,
        profileImage,
        platform,
        password,
      });

      await user.save();
    } else {
      // Update the last logged-in time
      user.lastLoggedIn = new Date();
      await user.save();
    }

    // Generate JWT token for social/normal user login
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      error: false,
      data: { user, token },
      msg: "Login successful.",
    });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Internal server error." });
  }
});

router.put("/profile", authorize(["user"]), async (req, res) => {
  const { country, city, area, cnic, password } = req.body;

  if (!req.user.id) {
    return res.status(400).json({ error: true, msg: "User ID is required." });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: true, msg: "User not found." });
    }

    // Update user profile
    user.country = country || user.country;
    user.city = city || user.city;
    user.area = area || user.area;
    user.cnic = cnic || user.cnic;
    user.password = password || user.password;
    await user.save();

    res.status(200).json({
      error: false,
      data: { user },
      msg: "Profile updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Internal server error." });
  }
});

export default router;
