import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be in hex format (#RRGGBB)'),
    type: z.enum(['income', 'expense']),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be in hex format (#RRGGBB)').optional(),
    type: z.enum(['income', 'expense']).optional(),
  }),
});

export const getCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listCategoriesSchema = z.object({
  query: z.object({
    type: z.enum(['income', 'expense']).optional(),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];
export type ListCategoriesQuery = z.infer<typeof listCategoriesSchema>['query'];
