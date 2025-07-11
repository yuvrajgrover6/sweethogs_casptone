import type { Request, Response, NextFunction } from "express";
import { BaseErrorException } from "../utils/error_handler";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", error);

  // Handle BaseErrorException with proper error codes and messages
  if (error instanceof BaseErrorException) {
    return res.status(error.code).json({
      error: error.error,
      message: error.message,
      code: error.code,
    });
  }

  // Handle other known error types
  if (error.name === "ValidationError") {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Invalid request data",
      code: 400,
    });
  }

  if (error.name === "MongoError" || error.name === "MongoServerError") {
    return res.status(500).json({
      error: "DATABASE_ERROR",
      message: "Database operation failed",
      code: 500,
    });
  }

  // Default error response
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
    code: 500,
  });
};
