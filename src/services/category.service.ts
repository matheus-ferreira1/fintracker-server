import { categoryRepository } from "@/repositories/category.repository";
import { AppError } from "@/types";
import type {
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "@/types/category.types";
import type { Category } from "generated/prisma/browser";
import { CategoryType } from "generated/prisma/enums";

const DEFAULT_CATEGORIES = {
  income: [
    { name: "Salary", color: "#10B981", type: CategoryType.income },
    { name: "Rent", color: "#10B981", type: CategoryType.income },
    { name: "Freelance", color: "#3B82F6", type: CategoryType.income },
    { name: "Investments", color: "#8B5CF6", type: CategoryType.income },
    { name: "Other Income", color: "#6366F1", type: CategoryType.income },
  ],
  expense: [
    { name: "Housing", color: "#EF4444", type: CategoryType.expense },
    { name: "Transportation", color: "#F59E0B", type: CategoryType.expense },
    { name: "Food", color: "#EC4899", type: CategoryType.expense },
    { name: "Utilities", color: "#14B8A6", type: CategoryType.expense },
    { name: "Healthcare", color: "#F43F5E", type: CategoryType.expense },
    { name: "Shopping", color: "#06B6D4", type: CategoryType.expense },
    { name: "Education", color: "#84CC16", type: CategoryType.expense },
    { name: "Other Expenses", color: "#64748B", type: CategoryType.expense },
  ],
} as const;

class CategoryService {
  async createDefaultCategories(userId: string): Promise<void> {
    const allDefaultCategories = [
      ...DEFAULT_CATEGORIES.income,
      ...DEFAULT_CATEGORIES.expense,
    ];

    await categoryRepository.createMany(userId, allDefaultCategories, true);
  }

  async createCategory(
    userId: string,
    categoryData: CreateCategoryDTO
  ): Promise<Category> {
    const exists = await categoryRepository.nameExists(
      userId,
      categoryData.name,
      categoryData.type
    );

    if (exists) {
      throw new AppError(
        409,
        `A ${categoryData.type} category with name "${categoryData.name}" already exists`
      );
    }

    return await categoryRepository.create(userId, categoryData, false);
  }

  async getCategories(userId: string, type: CategoryType): Promise<Category[]> {
    return await categoryRepository.findByUserId(userId, type);
  }

  async getCategory(userId: string, categoryId: string): Promise<Category> {
    const category = await categoryRepository.findById(categoryId, userId);

    if (!category) {
      throw new AppError(404, "Category not found");
    }

    return category;
  }

  async updateCategory(
    userId: string,
    categoryId: string,
    updates: UpdateCategoryDTO
  ): Promise<Category> {
    const existingCategory = await this.getCategory(userId, categoryId);

    if (existingCategory.isDefault) {
      throw new AppError(403, "Cannot update default categories");
    }

    if (updates.name && updates.name !== existingCategory.name) {
      const exists = await categoryRepository.nameExists(
        userId,
        updates.name,
        existingCategory.type
      );

      if (exists) {
        throw new AppError(
          409,
          `A ${existingCategory.type} category with name "${updates.name}" already exists`
        );
      }
    }

    const updatedCategory = await categoryRepository.update(
      categoryId,
      userId,
      updates
    );

    if (!updatedCategory) {
      throw new AppError(404, "Category not found or cannot be updated");
    }

    return updatedCategory;
  }

  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    const existingCategory = await this.getCategory(userId, categoryId);

    if (existingCategory.isDefault) {
      throw new AppError(403, "Cannot delete default categories");
    }

    const deleted = await categoryRepository.delete(categoryId, userId);

    if (!deleted) {
      throw new AppError(404, "Category not found or cannot be deleted");
    }
  }
}

export const categoryService = new CategoryService();
