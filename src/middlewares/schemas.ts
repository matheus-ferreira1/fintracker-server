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
