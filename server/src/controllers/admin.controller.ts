import { Request,Response,NextFunction } from "express";
import ejs from "ejs";
import path from "path";
import ErrorHandler from "../utils/ErrorHandler";
import {catchAsync} from "../middlewares/catchAsyncErrors";
import Admin,{IAdmin} from "../models/admin.model";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import sendMail from "../utils/sendMail";
import dotenv from "dotenv";
dotenv.config();

interface IRegisterBody{
    name:string;
    password:string;
    email:string;
    avatar?:string;
}

export const registerUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { name, email, password } = req.body;
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
          return next(new ErrorHandler("Admin already exists", 400));
        }
        const admin: IRegisterBody = {
          name,
          email,
          password,
        };
        const activationToken = createActivationToken(admin);
        const activationCode = activationToken.activationCode;
        const data = { user: { name: admin.name }, activationCode };
        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/activation-mail.ejs"),
          data
        );
        try {
          await sendMail({
            email: admin.email,
            subject: "Account Activation",
            template: "activation-mail.ejs",
            data,
          });
          res.status(200).json({
            success: true,
            message: `Account activation email has been sent to ${admin.email}`,
            activationToken: activationToken.token,
          });
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );
  interface IActivationToken {
    token: string;
    activationCode: string;
  }
  
  export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const token = jwt.sign(
      {
        user,
        activationCode,
      },
      process.env.ACTIVATION_SECRET as Secret,
      {
        expiresIn: "10m",
      }
    );
    return { token, activationCode };
  };
  
  interface IActivationRequest {
    activation_token: string;
    activation_code: string;
  }
  
  export const activateUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { activation_token, activation_code } =
          req.body as IActivationRequest;
        const newUser: { user: IAdmin; activationCode: string } = jwt.verify(
          activation_token,
          process.env.ACTIVATION_SECRET as string
        ) as { user: IAdmin; activationCode: string };
        if (newUser.activationCode !== activation_code) {
          return next(new ErrorHandler("Invalid activation code", 400));
        }
        const { name, email, password } = newUser.user;
        const existUser = await Admin.findOne({ email });
        if (existUser) {
          return next(new ErrorHandler("User already exists", 400));
        }
        const user = await Admin.create({ name, email, password });
        res.status(200).json({
          success: true,
          message: "Account has been activated successfully",
          user,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );