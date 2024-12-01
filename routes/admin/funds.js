import express from "express";
import Application from "../../modals/Applications.js";
import Transaction from "../../modals/Transactions.js";
import Fund from "../../modals/Fund.js";
import authorize from "../../middleware/authorize.js";

const router = express.Router();

/**
 * @route POST /api/funds
 * @desc Add a new fund entry
 * @access Admin
 */
router.post("/", authorize(["admin"]), async (req, res) => {
  const {
    applicationId,
    fundType,
    amount,
    frequency,
    startDate,
    endDate,
    chequeDetails,
    scannedDocuments,
  } = req.body;

  try {
    const fund = new Fund({
      applicationId,
      fundType,
      amount,
      frequency,
      startDate,
      endDate,
      chequeDetails,
      scannedDocuments,
      issuedBy: req.user.id,
    });

    await fund.save();

    res
      .status(201)
      .json({ error: false, data: fund, msg: "Fund added successfully." });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Internal server error." });
  }
});

/**
 * @route GET /api/funds/:id
 * @desc Retrieve details of a specific fund
 * @access Admin, Trustee
 */
router.get("/:id", authorize(["admin", "trustee"]), async (req, res) => {
  try {
    const fund = await Fund.findById(req.params.id)
      .populate("applicationId")
      .populate("issuedBy", "fullname email");

    if (!fund) {
      return res.status(404).json({ error: true, msg: "Fund not found." });
    }

    res.status(200).json({
      error: false,
      data: fund,
      msg: "Fund details retrieved successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Internal server error." });
  }
});

/**
 * @route GET /api/funds/total
 * @desc Calculate total spending (one-time and recurring) within a date range
 * @access Admin
 */
router.get("/total", authorize(["admin"]), async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: true, msg: "Start date and end date are required." });
  }

  try {
    const funds = await Fund.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });

    const totalSpent = funds.reduce((total, fund) => total + fund.amount, 0);
    const recurringFunds = funds.filter(
      (fund) => fund.fundType === "recurring"
    );

    res.status(200).json({
      error: false,
      data: {
        totalSpent,
        totalRecurring: recurringFunds.reduce(
          (total, fund) => total + fund.amount,
          0
        ),
      },
      msg: "Total spending calculated successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Internal server error." });
  }
});

/**
 * @route PATCH /api/funds/:id
 * @desc Update fund details (cheque and scanned documents)
 * @access Admin
 */
router.patch("/:id", authorize(["admin"]), async (req, res) => {
  const { chequeDetails, scannedDocuments } = req.body;

  try {
    const fund = await Fund.findById(req.params.id);

    if (!fund) {
      return res.status(404).json({ error: true, msg: "Fund not found." });
    }

    if (chequeDetails) fund.chequeDetails = chequeDetails;
    if (scannedDocuments) fund.scannedDocuments = scannedDocuments;

    await fund.save();

    res
      .status(200)
      .json({ error: false, data: fund, msg: "Fund updated successfully." });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Internal server error." });
  }
});

/**
 * @route GET /api/funds
 * @desc Retrieve all funds with optional filters
 * @access Admin, Trustee
 */
router.get("/", authorize(["admin", "trustee"]), async (req, res) => {
  const { startDate, endDate, fundType, frequency } = req.query;

  const filters = {};

  if (startDate && endDate) {
    filters.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  if (fundType) filters.fundType = fundType;
  if (frequency) filters.frequency = frequency;

  try {
    const funds = await Fund.find(filters)
      .populate("applicationId")
      .populate("issuedBy", "fullname email");

    res.status(200).json({
      error: false,
      data: funds,
      msg: "Funds retrieved successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Internal server error." });
  }
});

export default router;
