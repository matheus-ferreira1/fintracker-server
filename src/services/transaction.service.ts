import { categoryRepository } from "@/repositories/category.repository";
import { transactionRepository } from "@/repositories/transaction.repository";
import { AppError } from "@/types";
import type {
  AvailablePeriod,
  CreateTransactionDTO,
  TransactionFilters,
  UpdateTransactionDTO,
} from "@/types/transaction.types";
import type { Category, Transaction } from "generated/prisma/client";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

class TransactionService {
  async createTransaction(
    userId: string,
    transactionData: CreateTransactionDTO
  ): Promise<Transaction> {
    const category = await categoryRepository.findById(
      transactionData.categoryId,
      userId
    );

    if (!category) {
      throw new AppError(404, "Category not found");
    }

    return await transactionRepository.create(userId, transactionData);
  }

  async getTransaction(
    userId: string,
    transactionId: string
  ): Promise<Transaction & { category: Category }> {
    const transaction = await transactionRepository.findById(
      transactionId,
      userId
    );

    if (!transaction) {
      throw new AppError(404, "Transaction not found");
    }

    return transaction;
  }

  async getTransactions(
    userId: string,
    filters: TransactionFilters
  ): Promise<(Transaction & { category: Category })[]> {
    // Parse the period or use current month/year (December 2025)
    let month: number;
    let year: number;

    if (filters.period) {
      // Validate period format (MMYYYY)
      const periodRegex = /^(0[1-9]|1[0-2])\d{4}$/;
      if (!periodRegex.test(filters.period)) {
        throw new AppError(
          400,
          "Invalid period format. Expected format: MMYYYY (e.g., 012025)"
        );
      }

      // Extract month and year from period string
      month = Number.parseInt(filters.period.substring(0, 2), 10);
      year = Number.parseInt(filters.period.substring(2), 10);
    } else {
      // Use current month/year (December 2025)
      const now = new Date();
      month = now.getMonth() + 1; // getMonth() returns 0-11
      year = now.getFullYear();
    }

    // Create date range for the month
    // Start date: first day of the month at 00:00:00
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);

    // End date: last day of the month at 23:59:59.999
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Call repository with parsed filters
    return await transactionRepository.findWithFilters(userId, {
      startDate,
      endDate,
      categoryId: filters.categoryId,
      search: filters.search,
      type: filters.type,
    });
  }

  async updateTransaction(
    userId: string,
    transactionId: string,
    updates: UpdateTransactionDTO
  ): Promise<Transaction> {
    const existingTransaction = await this.getTransaction(
      userId,
      transactionId
    );

    if (
      updates.categoryId &&
      updates.categoryId !== existingTransaction.categoryId
    ) {
      const category = await categoryRepository.findById(
        updates.categoryId,
        userId
      );

      if (!category) {
        throw new AppError(404, "Category not found");
      }

      if (category.type !== existingTransaction.category.type) {
        throw new AppError(
          400,
          `Cannot change category to a different type. Current transaction is ${existingTransaction.category.type}.`
        );
      }
    }

    const updatedTransaction = await transactionRepository.update(
      transactionId,
      userId,
      updates
    );

    if (!updatedTransaction) {
      throw new AppError(404, "Transaction not found or cannot be updated");
    }

    return updatedTransaction;
  }

  async deleteTransaction(
    userId: string,
    transactionId: string
  ): Promise<boolean> {
    const deleted = await transactionRepository.delete(transactionId, userId);

    if (!deleted) {
      throw new AppError(404, "Transaction not found");
    }

    return true;
  }

  async getAvailablePeriods(userId: string): Promise<AvailablePeriod[]> {
    const results = await transactionRepository.getAvailablePeriods(userId);

    return results.map(({ period }) => {
      const year = period.getFullYear();
      const month = period.getMonth() + 1;

      const value = `${String(month).padStart(2, "0")}${year}`;

      return {
        value,
        year,
        month,
        label: `${monthNames[month - 1]} ${year}`,
      };
    });
  }
}

export const transactionService = new TransactionService();
