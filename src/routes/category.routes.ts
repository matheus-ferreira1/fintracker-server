import { categoryController } from "@/controllers/category.controller";
import {
  createCategorySchema,
  updateCategorySchema,
  uuidParamSchema,
} from "@/middlewares/schemas";
import { validate, validateParams } from "@/middlewares/validation";
import { Router } from "express";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate(createCategorySchema),
  categoryController.createCategory
);
router.get("/", categoryController.getCategories);
router.get(
  "/:id",
  validateParams(uuidParamSchema),
  categoryController.getCategory
);
router.patch(
  "/:id",
  validateParams(uuidParamSchema),
  validate(updateCategorySchema),
  categoryController.updateCategory
);
router.delete(
  "/:id",
  validateParams(uuidParamSchema),
  categoryController.deleteCategory
);

export default router;
