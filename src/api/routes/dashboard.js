import express from "express";
import { dashboardCtrl } from "../controllers/dashBoardController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", auth, dashboardCtrl);

export default router;
