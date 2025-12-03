import { AppError } from "@/types";
import type { NextFunction, Request, Response } from "express";
import type Joi from "joi";

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw new AppError(400, errorMessage);
    }

    next();
  };
};
