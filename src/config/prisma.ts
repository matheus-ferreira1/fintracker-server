import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { Pool } from "pg";
import { PrismaClient } from "../../generated/prisma/client";
import { config } from "./environment";

const connectionString = config.db.url;

const pool = new Pool({
  connectionString,
  max: config.db.maxConnections,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: config.env === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: config.env === "development" ? "pretty" : "minimal",
  });

if (config.env !== "production") {
  globalForPrisma.prisma = prisma;
}

export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log("Prisma Client disconnected");
};

export const testPrismaConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Prisma database connection test successful");
    return true;
  } catch (error) {
    console.error("Prisma database connection test failed:", error);
    return false;
  }
};

export default prisma;
