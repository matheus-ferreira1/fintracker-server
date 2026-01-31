import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    amount: z.string().regex(/^\d+(\.\d{1,4})?$/, 'Amount must be a valid number with up to 4 decimal places'),
    description: z.string().min(1).max(500),
    type: z.enum(['income', 'expense']),
    categoryId: z.string().uuid(),
    isRecurring: z.boolean().default(false),
    date: z.string().datetime(),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    amount: z.string().regex(/^\d+(\.\d{1,4})?$/, 'Amount must be a valid number with up to 4 decimal places').optional(),
    description: z.string().min(1).max(500).optional(),
    type: z.enum(['income', 'expense']).optional(),
    categoryId: z.string().uuid().optional(),
    isRecurring: z.boolean().optional(),
    date: z.string().datetime().optional(),
  }),
});

export const getTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const deleteTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listTransactionsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
    search: z.string().optional(),
    type: z.enum(['income', 'expense']).optional(),
    categoryId: z.string().uuid().optional(),
    sort: z.enum(['newest', 'oldest']).default('newest'),
  }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>['body'];
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>['body'];
export type ListTransactionsQuery = z.infer<typeof listTransactionsSchema>['query'];
