import { authService } from "@/services/auth.service";
import type {
  AuthRequest,
  LoginDTO,
  RegisterDTO,
  ResetPasswordDTO,
} from "@/types/auth.types";
import type { UpdateProfileDTO } from "@/types/user.types";
import type { Response } from "express";
import { config } from "../config/environment";
import { asyncHandler } from "../utils/asyncHandler";

class AuthController {
  register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const registerData: RegisterDTO = req.body;

    const { user, token } = await authService.register(registerData);

    res.cookie("token", token, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: "lax",
      maxAge: config.cookie.maxAge,
      domain: config.cookie.domain,
    });

    res.status(201).json({
      status: "success",
      data: user,
    });
  });

  login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const loginData: LoginDTO = req.body;

    const { user, token } = await authService.login(loginData);

    res.cookie("token", token, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: "lax",
      maxAge: config.cookie.maxAge,
      domain: config.cookie.domain,
    });

    res.status(200).json({
      status: "success",
      data: user,
    });
  });

  logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: "strict",
      domain: config.cookie.domain,
    });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  });

  getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await authService.validateSession(req.user!.id);

    res.status(200).json({
      status: "success",
      data: user,
    });
  });

  resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { oldPassword, newPassword }: ResetPasswordDTO = req.body;
    const userId = req.user!.id;

    await authService.resetPassword(userId, oldPassword, newPassword);

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const updateData: UpdateProfileDTO = req.body;
    const userId = req.user!.id;

    const user = await authService.updateProfile(userId, updateData);

    res.status(200).json({
      status: "success",
      data: user,
    });
  });
}

export const authController = new AuthController();
