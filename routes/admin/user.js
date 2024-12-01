import express from "express";
import User from "../../modals/Users.js";
import authorize from "../../middleware/authorize.js";

const router = express.Router();

router.post("/create-user", authorize(["admin"]), async (req, res) => {
  const { fullname, email, role, profileImage, country, city, area, cnic } =
    req.body;

  if (!fullname || !email || !role) {
    return res
      .status(400)
      .json({ error: true, msg: "Fullname, email, and role are required." });
  }

  if (
    !["department-hod", "trustee", "inquiry-officer", "admin"].includes(role)
  ) {
    return res.status(400).json({ error: true, msg: "Invalid role." });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: true, msg: "User already exists with this email." });
    }

    const newUser = new User({
      fullname,
      email,
      role,
      profileImage,
      country,
      city,
      area,
      cnic,
      password: "defaultpassword", // Optional, can be updated later
    });

    await newUser.save();
    res
      .status(201)
      .json({ error: false, data: newUser, msg: "User created successfully." });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Internal server error." });
  }
});

export default router;
