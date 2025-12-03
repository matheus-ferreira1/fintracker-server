import { authController } from "@/controllers/auth.controller";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "@/middlewares/schemas";
import { validate } from "@/middlewares/validation";
import { Router } from "express";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getCurrentUser);
router.put(
  "/reset-password",
  authenticate,
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.patch(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  authController.updateProfile
);

export default router;
