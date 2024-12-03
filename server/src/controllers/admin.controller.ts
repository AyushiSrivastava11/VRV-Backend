import { Request, Response, NextFunction } from "express";
import ejs from "ejs";
import path from "path";
import ErrorHandler from "../utils/ErrorHandler";
import { catchAsync } from "../middlewares/catchAsyncErrors";
import Admin, { IAdmin } from "../models/admin.model";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import sendMail from "../utils/sendMail";
import dotenv from "dotenv";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";
import { CustomRequest } from "../../@types/custom";
import { getAllUsersService, getUserById, updateUserRoleService } from "../services/admin.service";
dotenv.config();

interface IRegisterBody {
  name: string;
  password: string;
  email: string;
  role: string;
  avatar?: string;
}

export const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, role } = req.body;
      const adminExists = await Admin.findOne({ email });
      if (adminExists) {
        return next(new ErrorHandler("Admin already exists", 400));
      }
      const admin: IRegisterBody = {
        name,
        email,
        password,
        role,
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
      const { name, email, password, role } = newUser.user;
      const existUser = await Admin.findOne({ email });
      if (existUser) {
        return next(new ErrorHandler("User already exists", 400));
      }
      const user = await Admin.create({ name, email, password, role });
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

//Login User
interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;
      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
      }
      const user = await Admin.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
      }
      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
      }
      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const logoutUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "");
      res.cookie("refresh_token", "");
      res.status(200).json({
        success: true,
        message: "Logged out",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//Update Access Token

export const updateAccessToken = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      console.log(refresh_token);
      
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;
      const message = "Could not refresh token";
      if (!decoded) {
        return next(new ErrorHandler(message, 401));
      }
      const user = await Admin.findById(decoded.id);
      if (!user) {
        return next(new ErrorHandler(message, 401));
      }
      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        { expiresIn: "7d" }
      );
      req.user = user;
      res.cookie("access_token", accessToken, accessTokenOptions);
      res.cookie("refresh_token", refreshToken, refreshTokenOptions);
      res.status(200).json({
        status : "success",
        accessToken
      })
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//get user info
export const getUserInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id as string;
      if (!userId) {
        return next(new ErrorHandler("User ID is required", 400));
      }
      await getUserById(res, userId);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update user role --Admin

export const updateUserRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role, id } = req.body;
      updateUserRoleService(res, role, id);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//Update User info
interface IUpdateUserInfo {
  name?: string;
}
export const updateUserInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body as IUpdateUserInfo;
      const userId = req.user?._id;
      const user = await Admin.findById(userId);
      // if (email && user) {
      //   const emailExists = await User.findOne({ email });
      //   if (emailExists) {
      //     return next(new ErrorHandler("Email already exists", 400));
      //   } else {
      //     user.email = email;
      //   }
      // }
      if (name && user) {
        user.name = name;
      }
      await user?.save();
      res.status(201).json({
        success: true,
        message: "User updated successfully",
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);



//Delete user by admin
export const deleteUser = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
  try {
    const {id}= req.params;
    const user = await Admin.findById(id);
    if(!user) return next(new ErrorHandler("User not found",404));
    await user.deleteOne({id});
    res.status(200).json({
      success:true,
      message:"User deleted successfully"
    })

  } catch (error:any) {
    return next(new ErrorHandler(error.message,500));
  }
})


export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUsersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const adminId = req.user?._id;

      const admin = await Admin.findById(adminId);
      if (!admin) {
        return next(new ErrorHandler("Admin not found", 404));
      }

      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return next(new ErrorHandler("Current password is incorrect", 400));
      }

      admin.password = newPassword;
      await admin.save();

      res.status(200).json({ message: "Password changed successfully" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


export const getAllActiveMembers = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
  try {
    const users = await Admin.find({isActive:true});
    res.status(200).json({
      success:true,
      users
    })
  } catch (error:any) {
    return next(new ErrorHandler(error.message,500));
  }
});