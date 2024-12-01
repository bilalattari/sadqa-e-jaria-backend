import mongoose, { Schema, Types } from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    applicationId: { type: Types.ObjectId, ref: "Application", required: true },
    action: {
      type: String,
      enum: [
        "submitted",
        "reviewed",
        "returned-for-info",
        "inquiry-assigned",
        "inquiry-completed",
        "forwarded-to-trustee",
        "fund-approved",
        "fund-rejected",
        "fund-disbursed",
      ],
      required: true,
    },
    performedBy: { type: Types.ObjectId, ref: "User", required: true }, // User performing the action
    comments: { type: String }, // Comments related to the action
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
