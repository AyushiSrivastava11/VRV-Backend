// import ErrorHandler from "../utils/ErrorHandler";
// import {catchAsync} from "../middlewares/catchAsyncErrors";
import twilio from "twilio";
import dotenv from "dotenv";
import User, { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";

dotenv.config();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate OTP
const generateOtp = (): string => {
  const activationCode = Math.floor(100000 + Math.random() * 900000).toString();

  return activationCode; // Generates a 6-digit OTP
};

// Send OTP via SMS
export const sendOtp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).send("Phone number is required");
      return;
    }

    const otp = generateOtp();

    try {
      await twilioClient.messages.create({
        body: `Your OTP is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });

      const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
      const user: IUser | null = await User.findOne({ phone });
      if (user) {
        user.otp = otp;
        user.otpExpire = otpExpire;
        await user.save();
      } else {
        const newUser = new User({ phone, otp, otpExpire });
        await newUser.save();
      }

      res.status(200).send("OTP sent successfully");
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Verify OTP and Authenticate User
export const verifyOtp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) {
        res.status(400).send("Phone number and OTP are required");
        return;
      }

      const user: IUser | null = await User.findOne({
        phone,
        otpExpire: { $gt: new Date() }, // Check if OTP is still valid
      });

      if (!user) {
        res.status(404).json({ message: "Invalid or expired OTP" });
        return;
      }

      const isMatch = user.compareOtp(otp);

      if (!isMatch) {
        res.status(400).json({ message: "Invalid or expired OTP" });
        return;
      }

      user.otp = undefined;
      user.otpExpire = undefined;
      await user.save();

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1d",
        }
      );

      res.status(200).json({
        token,
        user: { id: user._id, phone: user.phone },
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Get User Orders
export const getUserOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { phone: string } | undefined;
    if (!user || !user.phone) {
      res.status(400).send("User phone number is required");
      return;
    }
    const { phone } = user;
    try {
      const user: IUser | null = await User.findOne({ phone });
      if (!user) {
        res.status(404).send("User not found");
        return;
      }
      res.status(200).json({ orders: user.orders });
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).send("Failed to fetch user orders");
    }
  }
);
