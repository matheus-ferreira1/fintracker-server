import { dashboardService } from "@/services/dashboard.service";
import type { AuthRequest } from "@/types/auth.types";
import type { DashboardFilters } from "@/types/dashboard.types";
import { asyncHandler } from "@/utils/asyncHandler";
import type { Response } from "express";

class DashboardController {
  getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const filters: DashboardFilters = {};

    if (req.query.period) {
      filters.period = req.query.period as string;
    }

    const dashboard = await dashboardService.getDashboard(userId, filters);

    res.status(200).json({
      status: "success",
      data: dashboard,
    });
  });
}

export const dashboardController = new DashboardController();
