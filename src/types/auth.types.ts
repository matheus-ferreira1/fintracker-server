import { type Request } from "express";
import type { UserDTO } from "./user.types";

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ResetPasswordDTO {
  oldPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
}

export interface AuthRequest extends Request {
  user?: UserDTO;
}
