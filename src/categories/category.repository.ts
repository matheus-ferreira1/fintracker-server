import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import { categories } from '../db/schema.js';

export interface CreateCategoryData {
  userId: string;
  name: string;
  color: string;
  type: 'income' | 'expense';
}

export interface UpdateCategoryData {
  name?: string;
  color?: string;
  type?: 'income' | 'expense';
}

export class CategoryRepository {
  async create(data: CreateCategoryData) {
    const [category] = await db
      .insert(categories)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return category;
  }

  async findById(id: string, userId: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
    return category;
  }

  async findByUserAndName(userId: string, name: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.userId, userId), eq(categories.name, name)));
    return category;
  }

  async findByUser(userId: string, type?: 'income' | 'expense') {
    const conditions = [eq(categories.userId, userId)];
    if (type) {
      conditions.push(eq(categories.type, type));
    }

    return await db
      .select()
      .from(categories)
      .where(and(...conditions))
      .orderBy(categories.name);
  }

  async update(id: string, userId: string, data: UpdateCategoryData) {
    const [updated] = await db
      .update(categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return updated;
  }

  async delete(id: string, userId: string) {
    await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
  }
}
