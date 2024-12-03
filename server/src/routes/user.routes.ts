import express from "express";
import {
  sendOtp,
  verifyOtp,
  getUserOrders,
} from "../controllers/user.controller";
const router = express.Router();
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/orders", getUserOrders);
export default router;