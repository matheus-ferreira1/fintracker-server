import { CategoryType } from "generated/prisma/enums";
import Joi from "joi";

const uuidSchema = Joi.string().uuid();
const emailSchema = Joi.string().email().lowercase().trim();
const passwordSchema = Joi.string().min(8).max(100);
const dateSchema = Joi.string().isoDate();

export const registerSchema = Joi.object({
  email: emailSchema.required(),
  password: passwordSchema.required(),
  name: Joi.string().min(2).max(100).trim().required(),
});

export const loginSchema = Joi.object({
  email: emailSchema.required(),
  password: Joi.string().required(),
});

export const resetPasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "any.required": "Old password is required",
    "string.empty": "Old password cannot be empty",
  }),
  newPassword: passwordSchema
    .required()
    .invalid(Joi.ref("oldPassword"))
    .messages({
      "any.required": "New password is required",
      "string.min": "New password must be at least 8 characters long",
      "string.max": "New password must not exceed 100 characters",
      "any.invalid": "New password must be different from old password",
    }),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim(),
  email: emailSchema,
})
  .min(1)
  .messages({
    "object.min": "At least one field (name or email) must be provided",
  });

export const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).trim().required(),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Color must be a valid hex color (e.g., #FF5733)",
    }),
  type: Joi.string()
    .valid(...Object.values(CategoryType))
    .required(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).trim(),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .messages({
      "string.pattern.base": "Color must be a valid hex color (e.g., #FF5733)",
    }),
}).min(1);

export const uuidParamSchema = Joi.object({
  id: uuidSchema.required(),
});

export const createTransactionSchema = Joi.object({
  categoryId: uuidSchema.required().messages({
    "string.guid": "Category ID must be a valid UUID",
    "any.required": "Category ID is required",
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be a positive number",
    "any.required": "Amount is required",
  }),
  description: Joi.string().min(1).max(500).trim().required().messages({
    "string.empty": "Description cannot be empty",
    "string.max": "Description must not exceed 500 characters",
    "any.required": "Description is required",
  }),
  date: dateSchema.required().messages({
    "string.isoDate": "Date must be a valid ISO 8601 date",
    "any.required": "Date is required",
  }),
  isRecurring: Joi.boolean().required().messages({
    "boolean.base": "isRecurring must be a boolean",
    "any.required": "isRecurring is required",
  }),
});

export const updateTransactionSchema = Joi.object({
  categoryId: uuidSchema.messages({
    "string.guid": "Category ID must be a valid UUID",
  }),
  amount: Joi.number().positive().precision(2).messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be a positive number",
  }),
  description: Joi.string().min(1).max(500).trim().messages({
    "string.empty": "Description cannot be empty",
    "string.max": "Description must not exceed 500 characters",
  }),
  date: dateSchema.messages({
    "string.isoDate": "Date must be a valid ISO 8601 date",
  }),
  isRecurring: Joi.boolean().messages({
    "boolean.base": "isRecurring must be a boolean",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

export const transactionFiltersSchema = Joi.object({
  period: Joi.string()
    .pattern(/^(0[1-9]|1[0-2])\d{4}$/)
    .messages({
      "string.pattern.base":
        "Period must be in format MMYYYY (e.g., 012025 for January 2025)",
    }),
  categoryId: uuidSchema.messages({
    "string.guid": "Category ID must be a valid UUID",
  }),
  search: Joi.string().min(1).max(100).trim().messages({
    "string.max": "Search query must not exceed 100 characters",
  }),
  type: Joi.string()
    .valid(...Object.values(CategoryType))
    .messages({
      "any.only": `Type must be one of: ${Object.values(CategoryType).join(
        ", "
      )}`,
    }),
  page: Joi.number().integer().min(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit must not exceed 100",
  }),
});

export const dashboardFiltersSchema = Joi.object({
  period: Joi.string()
    .pattern(/^(0[1-9]|1[0-2])\d{4}$/)
    .messages({
      "string.pattern.base":
        "Period must be in format MMYYYY (e.g., 012025 for January 2025)",
    }),
});
