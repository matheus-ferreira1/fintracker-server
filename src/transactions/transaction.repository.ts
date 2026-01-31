import { eq, and, desc, asc, ilike, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { transactions, categories } from '../db/schema.js';

export interface CreateTransactionData {
  userId: string;
  categoryId: string;
  amount: string;
  description: string;
  type: 'income' | 'expense';
  isRecurring: boolean;
  date: Date;
}

export interface UpdateTransactionData {
  categoryId?: string;
  amount?: string;
  description?: string;
  type?: 'income' | 'expense';
  isRecurring?: boolean;
  date?: Date;
}

export interface ListTransactionsFilter {
  userId: string;
  search?: string;
  type?: 'income' | 'expense';
  categoryId?: string;
  sort: 'newest' | 'oldest';
  page: number;
  limit: number;
}

export class TransactionRepository {
  async create(data: CreateTransactionData) {
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return transaction;
  }

  async findById(id: string, userId: string) {
    const [transaction] = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        categoryId: transactions.categoryId,
        amount: transactions.amount,
        description: transactions.description,
        type: transactions.type,
        isRecurring: transactions.isRecurring,
        date: transactions.date,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          type: categories.type,
        },
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return transaction;
  }

  async list(filter: ListTransactionsFilter) {
    const conditions = [eq(transactions.userId, filter.userId)];

    if (filter.search) {
      conditions.push(ilike(transactions.description, `%${filter.search}%`));
    }

    if (filter.type) {
      conditions.push(eq(transactions.type, filter.type));
    }

    if (filter.categoryId) {
      conditions.push(eq(transactions.categoryId, filter.categoryId));
    }

    const orderBy = filter.sort === 'newest'
      ? desc(transactions.date)
      : asc(transactions.date);

    const offset = (filter.page - 1) * filter.limit;

    const items = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        categoryId: transactions.categoryId,
        amount: transactions.amount,
        description: transactions.description,
        type: transactions.type,
        isRecurring: transactions.isRecurring,
        date: transactions.date,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          type: categories.type,
        },
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(filter.limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(transactions)
      .where(and(...conditions));

    return {
      items,
      total: count,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(count / filter.limit),
    };
  }

  async update(id: string, userId: string, data: UpdateTransactionData) {
    const [updated] = await db
      .update(transactions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();
    return updated;
  }

  async delete(id: string, userId: string) {
    await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
  }
}
