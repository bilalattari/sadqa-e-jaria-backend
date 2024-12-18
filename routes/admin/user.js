import express from "express";
import User from "../../modals/Users.js";
import authorize from "../../middleware/authorize.js";

const router = express.Router();

router.get(
  "/get-all-users",
  authorize(["admin", "department-hod"]),
  async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json({
        error: false,
        data: users,
        msg: "Users retrieved successfully.",
      });
    } catch (error) {
      res.status(500).json({ error: true, msg: "Internal server error." });
    }
  }
);

/**
 * @route GET /api/admin/users/get-users-by-role
 * @desc Retrieve users by role
 * @access Admin, Department HOD
 *
 * @example GET /api/admin/user/get-users-by-roles?roles=["admin", "department-hod"]
 */

router.get(
  "/get-users-by-roles",
  authorize(["admin", "department-hod"]),
  async (req, res) => {
    const rolesParam = req.query.roles;

    if (!rolesParam)
      return res.status(400).json({ error: true, msg: "Roles not provided." });

    try {
      const roles = JSON.parse(rolesParam);
      const users = await User.find({
        role: {
          $in: roles,
        },
      });
      res.status(200).json({
        error: false,
        data: users,
        msg: "Users retrieved successfully.",
      });
    } catch (error) {
      res.status(500).json({ error: true, msg: "Internal server error." });
      console.log("error fetching users by roles==>", error);
    }
  }
);

router.post("/create-user", async (req, res) => {
  const {
    fullname,
    email,
    role,
    password,
    profileImage,
    country,
    city,
    area,
    cnic,
  } = req.body;

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
      password,
      cnic,
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
