import { Request, Response, NextFunction } from "express";
import { catchAsync } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import Admin, { IAdmin } from "../models/admin.model";
import dotenv from "dotenv";
import { CustomRequest } from "../../../server/@types/custom"
dotenv.config();

// Authenticated User
export const isAuthenticated = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const access_token = req.cookies.access_token as string;
      
      if (!access_token) {
        return next(
          new ErrorHandler("Login first to access this resource", 401)
        );
      }
      const decoded = jwt.verify(
        access_token,
        process.env.ACCESS_TOKEN as string
      ) as JwtPayload;
      if (!decoded.id) {
        return next(new ErrorHandler("Wrong access token", 401));
      }
      const user = await Admin.findById(decoded.id);
      if (!user) {
        return next(new ErrorHandler("User not found", 401));
      }
      req.user = user as IAdmin;
      next();
    } catch (error) {
      console.log(error);
    }
  }
);

// Validate user role
export const validateRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if(!roles.includes(req.user?.role || '')){
      return next(new ErrorHandler(`Role (${req.user?.role}) is not allowed to access this resource`, 403));
    }
    next(); 
  };
};
