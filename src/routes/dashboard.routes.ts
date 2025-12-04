import { dashboardController } from "@/controllers/dashboard.controller";
import { authenticate } from "@/middlewares/auth";
import { dashboardFiltersSchema } from "@/middlewares/schemas";
import { validateQuery } from "@/middlewares/validation";
import { Router } from "express";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validateQuery(dashboardFiltersSchema),
  dashboardController.getDashboard
);

export default router;
