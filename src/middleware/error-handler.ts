import type { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const validationError = new ValidationError('Validation failed', err.issues);
    res.status(validationError.statusCode).json({
      error: {
        message: validationError.message,
        errors: validationError.errors,
      },
    });
    return;
  }

  if (err instanceof AppError) {
    logger.warn(
      {
        statusCode: err.statusCode,
        message: err.message,
        path: req.path,
        method: req.method,
      },
      'Application error',
    );

    res.status(err.statusCode).json({
      error: {
        message: err.message,
        ...(err instanceof ValidationError && { errors: err.errors }),
      },
    });
    return;
  }

  logger.error(
    {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    },
    'Unhandled error',
  );

  res.status(500).json({
    error: {
      message: 'Internal server error',
    },
  });
}
