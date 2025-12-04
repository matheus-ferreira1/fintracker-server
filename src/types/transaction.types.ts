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
  page?: number;
  limit?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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
  pagination: PaginationMetadata;
}

export interface FindWithFiltersResult {
  transactions: (Transaction & { category: Category })[];
  totalItems: number;
}
