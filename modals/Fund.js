import mongoose, { Schema, Types } from "mongoose";

const fundSchema = new mongoose.Schema(
  {
    applicationId: { type: Types.ObjectId, ref: "Application", required: true },
    fundType: { type: String, enum: ["one-time", "recurring"], required: true },
    amount: { type: Number, required: true },
    frequency: { type: String, enum: ["monthly", "seasonal"] },
    startDate: { type: Date },
    endDate: { type: Date }, // Optional for one-time funds
    issuedBy: { type: Types.ObjectId, ref: "User", required: true }, // Issuer's ID
    chequeDetails: {
      chequeNo: { type: String },
      bank: { type: String },
      issuedDate: { type: Date },
    },
    scannedDocuments: [{ type: String }], // Array of URLs for scanned documents
  },
  { timestamps: true }
);

const Fund = mongoose.model("Fund", fundSchema);

export default Fund;
