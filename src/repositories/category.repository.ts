import prisma from "@/config/prisma";
import type {
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "@/types/category.types";
import type { Category, CategoryType } from "generated/prisma/browser";

class CategoryRepository {
  async create(
    userId: string,
    categoryData: CreateCategoryDTO,
    isDefault: boolean = false
  ): Promise<Category> {
    return prisma.category.create({
      data: {
        userId,
        ...categoryData,
        isDefault,
      },
    });
  }

  async createMany(
    userId: string,
    categories: CreateCategoryDTO[],
    isDefault = false
  ): Promise<boolean> {
    const categoriesWithUser = categories.map((category) => ({
      ...category,
      userId,
      isDefault,
    }));
    const created = prisma.category.createMany({
      data: categoriesWithUser,
    });

    return created !== null;
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id, userId },
    });
  }

  async findByUserId(userId: string, type: CategoryType): Promise<Category[]> {
    return prisma.category.findMany({
      where: { userId, type },
    });
  }

  async update(
    id: string,
    userId: string,
    payload: UpdateCategoryDTO
  ): Promise<Category | null> {
    return prisma.category.update({
      where: { id, userId },
      data: payload,
    });
  }

  async nameExists(
    userId: string,
    name: string,
    type: CategoryType
  ): Promise<boolean> {
    const count = await prisma.category.count({
      where: { userId, name, type },
    });
    return count > 0;
  }

  async delete(id: string, userId: string) {
    return prisma.category.delete({
      where: { id, userId },
    });
  }
}

export const categoryRepository = new CategoryRepository();
