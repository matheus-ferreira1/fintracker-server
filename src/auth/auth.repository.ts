import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users, refreshTokens } from '../db/schema.js';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  name: string;
}

export interface CreateRefreshTokenData {
  userId: string;
  token: string;
  expiresAt: Date;
}

export class AuthRepository {
  async createUser(data: CreateUserData) {
    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async findUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async findUserById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createRefreshToken(data: CreateRefreshTokenData) {
    const [token] = await db
      .insert(refreshTokens)
      .values(data)
      .returning();
    return token;
  }

  async findRefreshToken(token: string) {
    const [refreshToken] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token));
    return refreshToken;
  }

  async deleteRefreshToken(token: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  async deleteUserRefreshTokens(userId: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }
}
