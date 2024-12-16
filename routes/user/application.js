import express from "express";
import Application from "../../modals/Applications.js";
import Transaction from "../../modals/Transactions.js";
import authorize from "../../middleware/authorize.js";
import crypto from "crypto";

const router = express.Router();

router.post("/", authorize(["user"]), async (req, res) => {
  const { category, subCategory, form } = req.body;
  const token = crypto.randomBytes(3).toString("hex");

  try {
    const application = new Application({
      category,
      subCategory,
      form,
      submittedBy: req.user.id,
      lastUpdatedBy: req.user.id,
      token,
    });

    await application.save();

    // Log the transaction
    const transaction = new Transaction({
      applicationId: application._id,
      role: "user",
      userId: req.user.id,
      performedBy: req.user.id,
      action: "submitted",
      comments: "Application submitted.",
    });

    await transaction.save();

    res.status(201).json({
      error: false,
      data: application,
      msg: "Application submitted successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Internal server error." });
  }
});

router.get("/token/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const application = await Application.findOne({ token }).populate(
      "submittedBy",
      "fullname email"
    );

    if (!application) {
      return res
        .status(404)
        .json({ error: true, msg: "Application not found." });
    }

    res.status(200).json({
      error: false,
      data: application,
      msg: "Application retrieved successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Internal server error." });
  }
});

export default router;
