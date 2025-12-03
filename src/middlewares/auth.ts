import { AppError } from "@/types";
import type { AuthRequest } from "@/types/auth.types";
import type { NextFunction, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyToken } from "../utils/jwt";
import { userRepository } from "@/repositories/user.repository";

export const authenticate = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const token = req.cookies?.token;

    if (!token) {
      throw new AppError(401, "Authentication required");
    }

    try {
      const decoded = verifyToken(token);

      const user = await userRepository.findById(decoded.userId);

      if (!user) {
        throw new AppError(401, "User not found");
      }

      req.user = user;

      next();
    } catch (error) {
      throw new AppError(401, "Invalid or expired token");
    }
  }
);
