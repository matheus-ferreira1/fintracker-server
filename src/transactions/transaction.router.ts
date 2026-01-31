import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { TransactionService } from './transaction.service.js';
import { TransactionRepository } from './transaction.repository.js';
import { CategoryRepository } from '../categories/category.repository.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionSchema,
  deleteTransactionSchema,
  listTransactionsSchema,
} from './transaction.schema.js';
import type { CreateTransactionInput, UpdateTransactionInput, ListTransactionsQuery } from './transaction.schema.js';

const router = Router();
const transactionRepository = new TransactionRepository();
const categoryRepository = new CategoryRepository();
const transactionService = new TransactionService(transactionRepository, categoryRepository);

router.use(authenticate);

router.get(
  '/',
  validate(listTransactionsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await transactionService.list(
        req.user!.userId,
        req.query as unknown as ListTransactionsQuery,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/',
  validate(createTransactionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transaction = await transactionService.create(
        req.user!.userId,
        req.body as CreateTransactionInput,
      );
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/:id',
  validate(getTransactionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transaction = await transactionService.findById(req.params.id!, req.user!.userId);
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  '/:id',
  validate(updateTransactionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transaction = await transactionService.update(
        req.params.id!,
        req.user!.userId,
        req.body as UpdateTransactionInput,
      );
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/:id',
  validate(deleteTransactionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await transactionService.delete(req.params.id!, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export default router;
