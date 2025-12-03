import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  apiPrefix: process.env.API_PREFIX || "/api/v1",

  db: {
    url: process.env.DATABASE_URL || "",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    name: process.env.DB_NAME || "fintracker",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || "20", 10),
    autoRunMigrations: process.env.DB_AUTO_RUN_MIGRATIONS === "true",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as string,
  },

  cookie: {
    secret: process.env.COOKIE_SECRET || "your-super-secret-cookie-key",
    domain: process.env.COOKIE_DOMAIN,
    secure: process.env.COOKIE_SECURE === "true",
    maxAge: parseInt(process.env.COOKIE_MAX_AGE || "604800000", 10), // 7 days
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3001",
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },
};

export const validateConfig = (): void => {
  const requiredEnvVars = ["JWT_SECRET", "COOKIE_SECRET"];

  if (config.env === "production") {
    requiredEnvVars.push("DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD");
  }

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
};
