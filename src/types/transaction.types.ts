import type { Category, Transaction } from "generated/prisma/client";
import type { CategoryType } from "generated/prisma/enums";

export interface CreateTransactionDTO {
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  isRecurring: boolean;
}

export interface UpdateTransactionDTO {
  categoryId?: string;
  amount?: number;
  description?: string;
  date?: string;
  isRecurring?: boolean;
}

export interface TransactionFilters {
  period?: string;
  categoryId?: string;
  search?: string;
  type?: CategoryType;
}

export interface AvailablePeriod {
  value: string;
  year: number;
  month: number;
  label: string;
}

export interface GetTransactionsResponse {
  transactions: (Transaction & { category: Category })[];
  count: number;
  sum: number;
}
