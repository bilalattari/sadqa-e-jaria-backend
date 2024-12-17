import express from "express";
import Application from "../../modals/Applications.js";
import Transaction from "../../modals/Transactions.js";
import authorize from "../../middleware/authorize.js";

const router = express.Router();

/**
 * @route GET /api/applications/filter
 * @desc Retrieve all applications with filters
 * @access Admin, Trustee
 */
router.get("/filter", authorize(["admin", "trustee"]), async (req, res) => {
  console.log("Request chal gye he??");
  const {
    startDate,
    endDate,
    country,
    city,
    category,
    subCategory,
    status,
    officerId,
    page,
    perPage,
  } = req.query;

  const filters = {};

  if (startDate && endDate) {
    filters.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }
  if (country) filters["form.country"] = country;
  if (city) filters["form.city"] = city;
  if (category) filters.category = category;
  if (subCategory) filters.subCategory = subCategory;
  if (status) filters.status = status;
  if (officerId) filters["inquiryReport.officerId"] = officerId;

  try {
    const applications = await Application.find(filters)
      .populate("submittedBy", "fullname email")
      .populate("inquiryReport.officerId", "fullname email");

    res.status(200).json({
      error: false,
      data: applications,
      msg: "Filtered applications retrieved successfully.",
    });
  } catch (error) {
    console.log("error=>", error);
    res.status(500).json({ error: true, msg: "Internal server error." });
  }
});

/**
 * @route GET /api/applications/:id
 * @desc View application details along with transaction history
 * @access User, Admin, Department HOD, Inquiry Officer, Trustee
 */
router.get(
  "/:id",
  authorize(["user", "admin", "department-hod", "inquiry-officer", "trustee"]),
  async (req, res) => {
    try {
      const application = await Application.findById(req.params.id)
        .populate("submittedBy", "fullname email")
        .populate("lastUpdatedBy", "fullname email");

      if (!application) {
        return res
          .status(404)
          .json({ error: true, msg: "Application not found." });
      }

      const transactions = await Transaction.find({
        applicationId: application._id,
      }).populate("performedBy", "fullname role");

      res.status(200).json({
        error: false,
        data: { application, transactions },
        msg: "Application details and history retrieved successfully.",
      });
    } catch (error) {
      console.log("error==>", error);
      res.status(500).json({ error: true, msg: "Internal server error." });
    }
  }
);

/**
 * @route PATCH /api/applications/:id/assign
 * @desc Assign an inquiry officer to an application
 * @access Admin, Department HOD
 */
router.patch(
  "/:id/assign",
  authorize(["department-hod", "admin"]),
  async (req, res) => {
    const { officerId, comments } = req.body;

    try {
      const application = await Application.findById(req.params.id);

      if (!application) {
        return res
          .status(404)
          .json({ error: true, msg: "Application not found." });
      }

      application.inquiryReport.officerId = officerId;
      application.status = "inquiry";
      application.lastUpdatedBy = req.user.id;

      await application.save();

      const transaction = new Transaction({
        applicationId: application._id,
        role: "department-hod",
        userId: req.user.id,
        action: "assigned-to-inquiry",
        comments: comments || "Assigned to inquiry officer.",
      });

      await transaction.save();

      res.status(200).json({
        error: false,
        data: application,
        msg: "Inquiry officer assigned successfully.",
      });
    } catch (error) {
      res.status(500).json({ error: true, msg: "Internal server error." });
    }
  }
);

/**
 * @route PATCH /api/applications/:id/inquiry
 * @desc Submit inquiry report by inquiry officer
 * @access Inquiry Officer
 */
router.patch(
  "/:id/inquiry",
  authorize(["inquiry-officer"]),
  async (req, res) => {
    const { comments, verified } = req.body;

    try {
      const application = await Application.findById(req.params.id);

      if (!application) {
        return res
          .status(404)
          .json({ error: true, msg: "Application not found." });
      }

      application.inquiryReport.comments = comments;
      application.inquiryReport.verified = verified;
      application.status = "hod-review";
      application.lastUpdatedBy = req.user.id;

      await application.save();

      const transaction = new Transaction({
        applicationId: application._id,
        role: "inquiry-officer",
        userId: req.user.id,
        action: "submitted-inquiry-report",
        comments,
      });

      await transaction.save();

      res.status(200).json({
        error: false,
        data: application,
        msg: "Inquiry report submitted successfully.",
      });
    } catch (error) {
      res.status(500).json({ error: true, msg: "Internal server error." });
    }
  }
);

/**
 * @route PATCH /api/applications/:id/return
 * @desc HOD returns report to user for additional information
 * @access Department HOD
 */
router.patch("/:id/return", authorize(["department-hod"]), async (req, res) => {
  const { comments } = req.body;

  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res
        .status(404)
        .json({ error: true, msg: "Application not found." });
    }

    application.status = "pending"; // Reset status to pending
    application.lastUpdatedBy = req.user.id;

    await application.save();

    const transaction = new Transaction({
      applicationId: application._id,
      role: "department-hod",
      userId: req.user.id,
      action: "returned",
      comments: comments || "Additional information required.",
    });

    await transaction.save();

    res.status(200).json({
      error: false,
      data: application,
      msg: "Application returned to user for additional information.",
    });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Internal server error." });
  }
});

/**
 * @route GET /api/trustee/applications
 * @desc Retrieve applications for trustee review
 * @access Trustee
 */
router.get(
  "/trustee/applications",
  authorize(["trustee"]),
  async (req, res) => {
    try {
      const applications = await Application.find({
        status: "committee-review",
      })
        .populate("inquiryReport.officerId", "fullname email")
        .populate("submittedBy", "fullname email");

      res.status(200).json({
        error: false,
        data: applications,
        msg: "Applications retrieved successfully.",
      });
    } catch (error) {
      res.status(500).json({ error: true, msg: "Internal server error." });
    }
  }
);

/**
 * @route PATCH /api/applications/:id/status
 * @desc Admin rejects or puts application on hold
 * @access Admin
 */
router.patch("/:id/status", authorize(["admin"]), async (req, res) => {
  const { status, comments } = req.body; // Status can be "rejected" or "on-hold"

  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res
        .status(404)
        .json({ error: true, msg: "Application not found." });
    }

    application.status = status;
    application.lastUpdatedBy = req.user.id;

    await application.save();

    const transaction = new Transaction({
      applicationId: application._id,
      role: "admin",
      userId: req.user.id,
      action: status,
      comments,
    });

    await transaction.save();

    res.status(200).json({
      error: false,
      data: application,
      msg: `Application marked as ${status}.`,
    });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Internal server error." });
  }
});

/**
 * @route GET /api/inquiry/applications
 * @desc Retrieve applications assigned to the inquiry officer
 * @access Inquiry Officer
 */
router.get(
  "/inquiry/applications",
  authorize(["inquiry-officer"]),
  async (req, res) => {
    try {
      const applications = await Application.find({
        "inquiryReport.officerId": req.user.id,
      }).populate("submittedBy", "fullname email");

      res.status(200).json({
        error: false,
        data: applications,
        msg: "Assigned applications retrieved successfully.",
      });
    } catch (error) {
      res.status(500).json({ error: true, msg: "Internal server error." });
    }
  }
);

/**
 * @route GET /api/applications/:id/history
 * @desc Fetch history (transactions) of a single application report
 * @access User, Admin, Department HOD, Inquiry Officer, Trustee
 */
router.get(
  "/:id/history",
  authorize(["user", "admin", "department-hod", "inquiry-officer", "trustee"]),
  async (req, res) => {
    try {
      const transactions = await Transaction.find({
        applicationId: req.params.id,
      })
        .populate("userId", "fullname role email")
        .sort({ date: -1 }); // Sort by latest action first

      if (!transactions || transactions.length === 0) {
        return res
          .status(404)
          .json({ error: true, msg: "No history found for this application." });
      }

      res.status(200).json({
        error: false,
        data: transactions,
        msg: "Application history retrieved successfully.",
      });
    } catch (error) {
      res.status(500).json({ error: true, msg: "Internal server error." });
    }
  }
);

export default router;
