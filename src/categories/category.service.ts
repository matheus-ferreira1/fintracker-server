import { CategoryRepository } from './category.repository.js';
import { ConflictError, NotFoundError } from '../lib/errors.js';
import type { CreateCategoryInput, UpdateCategoryInput, ListCategoriesQuery } from './category.schema.js';

export class CategoryService {
  constructor(private repository: CategoryRepository) {}

  async create(userId: string, input: CreateCategoryInput) {
    const existing = await this.repository.findByUserAndName(userId, input.name);
    if (existing) {
      throw new ConflictError('Category with this name already exists');
    }

    return await this.repository.create({
      userId,
      ...input,
    });
  }

  async findById(id: string, userId: string) {
    const category = await this.repository.findById(id, userId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  async list(userId: string, query: ListCategoriesQuery) {
    return await this.repository.findByUser(userId, query.type);
  }

  async update(id: string, userId: string, input: UpdateCategoryInput) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Category not found');
    }

    if (input.name && input.name !== existing.name) {
      const nameExists = await this.repository.findByUserAndName(userId, input.name);
      if (nameExists) {
        throw new ConflictError('Category with this name already exists');
      }
    }

    const updated = await this.repository.update(id, userId, input);
    if (!updated) {
      throw new NotFoundError('Category not found');
    }
    return updated;
  }

  async delete(id: string, userId: string) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Category not found');
    }

    await this.repository.delete(id, userId);
  }
}
