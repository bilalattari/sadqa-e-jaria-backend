import express from "express";
import User from "../../modals/Users.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { fullname, email, profileImage, platform } = req.body;

  if (!fullname || !email) {
    return res
      .status(400)
      .json({ error: true, msg: "Fullname and email are required." });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Register the user
      user = new User({
        fullname,
        email,
        profileImage,
        platform,
      });
      await user.save();
    } else {
      // Update last logged-in time
      user.lastLoggedIn = new Date();
      await user.save();
    }

    res
      .status(200)
      .json({ error: false, data: user, msg: "Login successful." });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Internal server error." });
  }
});

router.put("/profile", async (req, res) => {
  const { userId, country, city, area, cnic } = req.body;

  if (!userId) {
    return res.status(400).json({ error: true, msg: "User ID is required." });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: true, msg: "User not found." });
    }

    // Update user profile
    user.country = country || user.country;
    user.city = city || user.city;
    user.area = area || user.area;
    user.cnic = cnic || user.cnic;
    await user.save();

    const token = generateToken(user);

    res
      .status(200)
      .json({
        error: false,
        data: { user, token },
        msg: "Profile updated successfully.",
      });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Internal server error." });
  }
});

export default router;
