import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const dbURL: string = process.env.mongoURL || "";
export const connectDB = async () => {
  try {
    await mongoose.connect(dbURL);
    console.log("Database connected successfully");
  } catch (error: any) {
    console.log(error.message);
  }
};
