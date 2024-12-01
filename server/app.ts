import express, { NextFunction, Request, Response } from "express";
import { ErrorMiddleware } from "./src/middlewares/error";
export const app = express();

app.use(express.json());

//Routes
const Router = express();
app.use("/api/v1",Router);

//Unknown Routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Cannot find ${req.originalUrl} on this server`) as any;
    error.statusCode = 404;
    next(error);
  });

//Error Handler
app.use(ErrorMiddleware);