import { describe, it, expect } from 'bun:test';
import { AppError, NotFoundError, UnauthorizedError, ValidationError, ConflictError } from './errors';

describe('Error Classes', () => {
  it('AppError should create error with status code', () => {
    const error = new AppError(500, 'Server error');
    expect(error.message).toBe('Server error');
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
  });

  it('NotFoundError should have 404 status', () => {
    const error = new NotFoundError('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Resource not found');
  });

  it('UnauthorizedError should have 401 status', () => {
    const error = new UnauthorizedError('Invalid token');
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Invalid token');
  });

  it('ValidationError should have 400 status', () => {
    const error = new ValidationError('Invalid input', { field: 'email' });
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Invalid input');
    expect(error.errors).toEqual({ field: 'email' });
  });

  it('ConflictError should have 409 status', () => {
    const error = new ConflictError('Email already exists');
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('Email already exists');
  });
});
