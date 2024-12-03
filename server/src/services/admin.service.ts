//get user by id

import { Response } from "express";
import Admin from "../models/admin.model";

export const getUserById = async (res: Response, id: string) => {
  const user = await Admin.findById(id);
  res.status(200).json({
    success: true,
    user,
  });
};

//get all users
export const getAllUsersService = async (res: Response) => {
  const users = await Admin.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    users,
  });
};

export const updateUserRoleService = async (
  res: Response,
  role: string,
  id: string
) => {
  const user = await Admin.findByIdAndUpdate(id,{role},{new:true});
  res.status(200).json({
    success: true,
    user,
  });
};
