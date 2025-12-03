import type { UserDTO } from "@/types/user.types";
import jwt from "jsonwebtoken";
import { config } from "../config/environment";

export interface JWTPayload {
  userId: string;
  email: string;
}

export const generateToken = (user: UserDTO): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};
