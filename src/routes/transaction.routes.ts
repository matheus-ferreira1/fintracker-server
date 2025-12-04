import { transactionController } from "@/controllers/transaction.controller";
import {
  createTransactionSchema,
  transactionFiltersSchema,
  updateTransactionSchema,
  uuidParamSchema,
} from "@/middlewares/schemas";
import {
  validate,
  validateParams,
  validateQuery,
} from "@/middlewares/validation";
import { Router } from "express";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.get("/periods", transactionController.getAvailablePeriods);

router.post(
  "/",
  validate(createTransactionSchema),
  transactionController.createTransaction
);

router.get(
  "/",
  validateQuery(transactionFiltersSchema),
  transactionController.getTransactions
);

router.get(
  "/:id",
  validateParams(uuidParamSchema),
  transactionController.getTransaction
);

router.patch(
  "/:id",
  validateParams(uuidParamSchema),
  validate(updateTransactionSchema),
  transactionController.updateTransaction
);

router.delete(
  "/:id",
  validateParams(uuidParamSchema),
  transactionController.deleteTransaction
);

export default router;
