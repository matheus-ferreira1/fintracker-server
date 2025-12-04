import prisma from "@/config/prisma";
import type {
  CreateTransactionDTO,
  FindWithFiltersResult,
  PaginationParams,
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
      categoryId: string | undefined;
      search: string | undefined;
      type: CategoryType | undefined;
    },
    pagination: PaginationParams
  ): Promise<FindWithFiltersResult> {
    const { startDate, endDate, categoryId, search, type } = filters;
    const { page, limit } = pagination;

    const where: any = {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.description = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (type) {
      where.category = {
        type,
      };
    }

    const skip = (page - 1) * limit;

    const [transactions, totalItems] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          date: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.transaction.count({
        where,
      }),
    ]);

    return {
      transactions,
      totalItems,
    };
  }

  async getSumForFilters(
    userId: string,
    filters: {
      startDate: Date;
      endDate: Date;
      categoryId: string | undefined;
      search: string | undefined;
      type: CategoryType | undefined;
    }
  ): Promise<number> {
    const { startDate, endDate, categoryId, search, type } = filters;

    // Build the where clause for filtering
    const where: any = {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.description = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (type) {
      where.category = {
        type,
      };
    }

    // Use aggregate to calculate sum efficiently
    const result = await prisma.transaction.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });

    return Number(result._sum.amount) || 0;
  }
}

export const transactionRepository = new TransactionRepository();
