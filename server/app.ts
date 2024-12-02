import express, { NextFunction, Request, Response } from "express";
import { ErrorMiddleware } from "./src/middlewares/error";
// import userRouter from "./src/routes/user.routes";
import adminRouter from "./src/routes/admin.routes"
import cors from "cors";
import cookieParser from "cookie-parser";
export const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials:true,
  })
);
app.use(cookieParser());
//Routes
app.use("/api/v1/admin/",adminRouter);
// app.use("/api/v1/user/",userRouter);

//Unknown Routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Cannot find ${req.originalUrl} on this server`) as any;
    error.statusCode = 404;
    next(error);
  });

//Error Handler
app.use(ErrorMiddleware);