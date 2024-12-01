dotenv.config({ path: "./.env" });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";
import userRoutes from "./routes/user/index.js";
import adminRoutes from "./routes/admin/index.js";

// Create Express app
const app = express();
app.use(morgan("dev"));

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB", process.env.MONGODB_URI);
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Middleware
app.use(cors()); // Enable CORS
app.use(helmet()); // Set security-related headers
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

app.get("/", (req, res) => {
  res.send(new Date());
});




app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);
// Start server
const PORT = process.env.PORT || 8015;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
