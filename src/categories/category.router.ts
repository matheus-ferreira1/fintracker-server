import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service.js';
import { CategoryRepository } from './category.repository.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  deleteCategorySchema,
  listCategoriesSchema,
} from './category.schema.js';
import type { CreateCategoryInput, UpdateCategoryInput, ListCategoriesQuery } from './category.schema.js';

const router = Router();
const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);

router.use(authenticate);

router.get(
  '/',
  validate(listCategoriesSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await categoryService.list(
        req.user!.userId,
        req.query as ListCategoriesQuery,
      );
      res.json(categories);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/',
  validate(createCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await categoryService.create(
        req.user!.userId,
        req.body as CreateCategoryInput,
      );
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/:id',
  validate(getCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await categoryService.findById(req.params.id!, req.user!.userId);
      res.json(category);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  '/:id',
  validate(updateCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await categoryService.update(
        req.params.id!,
        req.user!.userId,
        req.body as UpdateCategoryInput,
      );
      res.json(category);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/:id',
  validate(deleteCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await categoryService.delete(req.params.id!, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export default router;
