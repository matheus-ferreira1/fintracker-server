import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import YAML from "yamljs";
import { config } from "./config/environment";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import routes from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    })
  );

  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: "Too many requests from this IP, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api", limiter);

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.use(cookieParser(config.cookie.secret));

  app.use(compression());

  if (config.env === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "success",
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
    });
  });

  try {
    const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"));
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch (error) {
    console.warn("Swagger documentation not available");
  }

  app.use(config.apiPrefix, routes);

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
};
