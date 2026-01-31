import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service.js';
import { DashboardRepository } from './dashboard.repository.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const dashboardRepository = new DashboardRepository();
const dashboardService = new DashboardService(dashboardRepository);

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dashboard = await dashboardService.getDashboard(req.user!.userId);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
});

export default router;
