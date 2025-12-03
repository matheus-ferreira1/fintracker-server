import { AppError } from "@/types";
import type { NextFunction, Request, Response } from "express";
import { createLogger } from "../utils/logger";

const logger = createLogger("ErrorHandler");

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  if (err.name === "QueryFailedError" || (err as any).code) {
    const dbError = err as any;

    if (dbError.code === "23505") {
      return res.status(409).json({
        status: "error",
        message: "Resource already exists",
      });
    }

    if (dbError.code === "23503") {
      return res.status(400).json({
        status: "error",
        message: "Invalid reference to related resource",
      });
    }

    if (dbError.code === "23514") {
      return res.status(400).json({
        status: "error",
        message: "Invalid data provided",
      });
    }
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      message: "Invalid authentication token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      message: "Authentication token has expired",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }

  logger.error("Unhandled error:", err);

  return res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
};
