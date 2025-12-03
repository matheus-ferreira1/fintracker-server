import type { CategoryType } from "generated/prisma/enums";

export interface CreateCategoryDTO {
  name: string;
  color: string;
  type: CategoryType;
}

export interface UpdateCategoryDTO {
  name?: string;
  color?: string;
}
