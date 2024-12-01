import express from "express";
const adminRoutes = express.Router();

import Application from "./application.js";
import User from "./user.js";
import Fund from "./user.js";

adminRoutes.use("/application", Application);
adminRoutes.use("/user", User);
adminRoutes.use("/funds", Fund);

export default adminRoutes;
