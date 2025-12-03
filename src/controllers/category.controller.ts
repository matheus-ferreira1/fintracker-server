import { categoryService } from "@/services/category.service";
import type { AuthRequest } from "@/types/auth.types";
import type {
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "@/types/category.types";
import type { Response } from "express";
import type { CategoryType } from "generated/prisma/enums";
import { asyncHandler } from "../utils/asyncHandler";

class CategoryController {
  createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const categoryData: CreateCategoryDTO = req.body;
    const userId = req.user!.id;

    const category = await categoryService.createCategory(userId, categoryData);

    res.status(201).json({
      status: "success",
      data: category,
    });
  });

  getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const type = req.query.type as CategoryType;

    const categories = await categoryService.getCategories(userId, type);

    res.status(200).json({
      status: "success",
      data: categories,
    });
  });

  getCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };

    const category = await categoryService.getCategory(userId, id);

    res.status(200).json({
      status: "success",
      data: category,
    });
  });

  updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };
    const updates: UpdateCategoryDTO = req.body;

    const category = await categoryService.updateCategory(userId, id, updates);

    res.status(200).json({
      status: "success",
      data: category,
    });
  });

  deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };

    await categoryService.deleteCategory(userId, id);

    res.status(204).send();
  });
}

export const categoryController = new CategoryController();
