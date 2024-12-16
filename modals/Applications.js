import mongoose, { Schema, Types } from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    category: { type: String, required: true }, // Main category of help
    subCategory: { type: String }, // Subcategory of help
    form: { type: Schema.Types.Mixed, required: true }, // Flexible structure for form data
    status: {
      type: String,
      enum: [
        "pending",
        "in-review",
        "hold",
        "returned",
        "inquiry",
        "committee-review",
        "approved",
        "rejected",
        "funded",
      ],
      default: "pending",
    },
    token: { type: String, unique: true },
    inquiryReport: {
      comments: { type: String },
      verified: { type: Boolean, default: false },
      officerId: { type: Types.ObjectId, ref: "User" }, // Reference to Inquiry Officer
    },
    trusteeComments: { type: String }, // Trustee comments on funding
    fundingDetails: {
      type: {
        fundType: { type: String, enum: ["one-time", "recurring"] },
        amount: { type: Number },
        frequency: { type: String, enum: ["monthly", "seasonal"] },
        startDate: { type: Date },
        endDate: { type: Date }, // Optional for one-time funds
      },
    },
    submittedBy: { type: Types.ObjectId, ref: "User", required: true }, // Reference to User
    lastUpdatedBy: { type: Types.ObjectId, ref: "User" }, // User who last updated
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;
