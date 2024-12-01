import mongoose, { Schema, Types } from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    applicationId: { type: Types.ObjectId, ref: "Application", required: true }, // Link to the application
    userId: { type: Types.ObjectId, ref: "User", required: true }, // Link to the user
    documentType: { type: String, required: true }, // e.g., "institute_picture", "registration_certificate"
    fileUrl: { type: String, required: true }, // File URL stored in a cloud service (e.g., AWS S3, Firebase Storage)
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
