import express from "express";
const userRoutes = express.Router();

import Application from "./application.js";
import User from "./user.js";

userRoutes.use("/application", Application);
userRoutes.use("/user", User);

export default userRoutes;
