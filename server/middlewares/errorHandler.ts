import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError.js";

const sendError = (err: AppError, req: Request, res: Response) => {
  const { message, statusCode } = err;

  res.json({ error: { statusCode, message } });
};

const globalErrorHandlerMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  sendError(err, req, res);
  console.log(err);
  console.log(
    "--------------------------------------------------------------------------------------"
  );
};

export default globalErrorHandlerMiddleware;
