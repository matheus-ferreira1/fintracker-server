import { TransactionRepository } from './transaction.repository.js';
import { CategoryRepository } from '../categories/category.repository.js';
import { NotFoundError, ValidationError } from '../lib/errors.js';
import type { CreateTransactionInput, UpdateTransactionInput, ListTransactionsQuery } from './transaction.schema.js';

export class TransactionService {
  constructor(
    private repository: TransactionRepository,
    private categoryRepository: CategoryRepository,
  ) {}

  async create(userId: string, input: CreateTransactionInput) {
    const category = await this.categoryRepository.findById(input.categoryId, userId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (category.type !== input.type) {
      throw new ValidationError('Transaction type must match category type');
    }

    return await this.repository.create({
      userId,
      categoryId: input.categoryId,
      amount: input.amount,
      description: input.description,
      type: input.type,
      isRecurring: input.isRecurring,
      date: new Date(input.date),
    });
  }

  async findById(id: string, userId: string) {
    const transaction = await this.repository.findById(id, userId);
    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }
    return transaction;
  }

  async list(userId: string, query: ListTransactionsQuery) {
    return await this.repository.list({
      userId,
      search: query.search,
      type: query.type,
      categoryId: query.categoryId,
      sort: query.sort,
      page: query.page,
      limit: query.limit,
    });
  }

  async update(id: string, userId: string, input: UpdateTransactionInput) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Transaction not found');
    }

    if (input.categoryId) {
      const category = await this.categoryRepository.findById(input.categoryId, userId);
      if (!category) {
        throw new NotFoundError('Category not found');
      }

      const transactionType = input.type ?? existing.type;
      if (category.type !== transactionType) {
        throw new ValidationError('Transaction type must match category type');
      }
    }

    if (input.type && input.type !== existing.category.type) {
      throw new ValidationError('Transaction type must match category type');
    }

    const updated = await this.repository.update(id, userId, {
      ...input,
      date: input.date ? new Date(input.date) : undefined,
    });

    if (!updated) {
      throw new NotFoundError('Transaction not found');
    }

    return updated;
  }

  async delete(id: string, userId: string) {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Transaction not found');
    }

    await this.repository.delete(id, userId);
  }
}
