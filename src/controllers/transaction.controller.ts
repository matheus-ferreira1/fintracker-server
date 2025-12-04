import { transactionService } from "@/services/transaction.service";
import type { AuthRequest } from "@/types/auth.types";
import type {
  CreateTransactionDTO,
  TransactionFilters,
  UpdateTransactionDTO,
} from "@/types/transaction.types";
import type { Response } from "express";
import type { CategoryType } from "generated/prisma/enums";
import { asyncHandler } from "../utils/asyncHandler";

class TransactionController {
  createTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const transactionData: CreateTransactionDTO = req.body;
    const userId = req.user!.id;

    const transaction = await transactionService.createTransaction(
      userId,
      transactionData
    );

    res.status(201).json({
      status: "success",
      data: transaction,
    });
  });

  getTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };

    const transaction = await transactionService.getTransaction(userId, id);

    res.status(200).json({
      status: "success",
      data: transaction,
    });
  });

  getTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const filters: TransactionFilters = {};

    if (req.query.period) {
      filters.period = req.query.period as string;
    }
    if (req.query.categoryId) {
      filters.categoryId = req.query.categoryId as string;
    }
    if (req.query.search) {
      filters.search = req.query.search as string;
    }
    if (req.query.type) {
      filters.type = req.query.type as CategoryType;
    }

    const transactions = await transactionService.getTransactions(
      userId,
      filters
    );

    res.status(200).json({
      status: "success",
      data: transactions,
    });
  });

  updateTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };
    const updates: UpdateTransactionDTO = req.body;

    const transaction = await transactionService.updateTransaction(
      userId,
      id,
      updates
    );

    res.status(200).json({
      status: "success",
      data: transaction,
    });
  });

  deleteTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };

    await transactionService.deleteTransaction(userId, id);

    res.status(204).send();
  });

  getAvailablePeriods = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user!.id;

      const periods = await transactionService.getAvailablePeriods(userId);

      res.status(200).json({
        status: "success",
        data: periods,
      });
    }
  );
}

export const transactionController = new TransactionController();
