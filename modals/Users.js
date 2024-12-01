import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    profileImage: { type: String }, // URL to profile image
    country: { type: String },
    city: { type: String },
    area: { type: String },
    cnic: { type: String }, // CNIC (unique identifier for the user, optional)
    platform: {
      type: String,
      enum: ["google", "web", "mobile"],
      default: "web",
    }, // Platform from which user logs in
    password: { type: String }, // Only for admin-created users (optional)
    role: {
      type: String,
      enum: ["user", "department-hod", "trustee", "inquiry-officer", "admin"],
      default: "user",
    },
    lastLoggedIn: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
