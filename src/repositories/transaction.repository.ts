import prisma from "@/config/prisma";
import type {
  CreateTransactionDTO,
  UpdateTransactionDTO,
} from "@/types/transaction.types";
import type { CategoryType, Transaction } from "generated/prisma/browser";
import type { Category } from "generated/prisma/client";

class TransactionRepository {
  async create(
    userId: string,
    transactionData: CreateTransactionDTO
  ): Promise<Transaction> {
    return prisma.transaction.create({
      data: {
        userId,
        ...transactionData,
      },
    });
  }

  async findById(
    id: string,
    userId: string
  ): Promise<(Transaction & { category: Category }) | null> {
    return prisma.transaction.findUnique({
      where: { id, userId },
      include: {
        category: true,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    payload: UpdateTransactionDTO
  ): Promise<Transaction | null> {
    return prisma.transaction.update({
      where: { id, userId },
      data: payload,
    });
  }

  async delete(id: string, userId: string) {
    return prisma.transaction.delete({
      where: { id, userId },
    });
  }

  async getAvailablePeriods(userId: string): Promise<{ period: Date }[]> {
    return prisma.$queryRaw`
    SELECT DISTINCT DATE_TRUNC('month', t.date) AS period
    FROM "Transaction" t
    WHERE t."userId" = ${userId}
    ORDER BY period DESC
  `;
  }

  async findWithFilters(
    userId: string,
    filters: {
      startDate: Date;
      endDate: Date;
      categoryId?: string | undefined;
      search?: string | undefined;
      type?: CategoryType | undefined;
    }
  ): Promise<(Transaction & { category: Category })[]> {
    const { startDate, endDate, categoryId, search, type } = filters;

    // Build the where clause dynamically based on provided filters
    const where: any = {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Add category filter if provided
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Add search filter for description if provided
    if (search) {
      where.description = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Add type filter if provided
    // Note: type filter is applied via category relation
    if (type) {
      where.category = {
        type,
      };
    }

    return prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });
  }
}

export const transactionRepository = new TransactionRepository();
