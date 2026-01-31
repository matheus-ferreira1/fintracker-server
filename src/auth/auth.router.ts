import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { AuthRepository } from './auth.repository.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema.js';
import type { RegisterInput, LoginInput, RefreshInput } from './auth.schema.js';

const router = Router();
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

router.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body as RegisterInput);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body as LoginInput);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/refresh',
  validate(refreshSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.refresh(req.body as RefreshInput);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
