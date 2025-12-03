import { createApp } from "./app";
import { config, validateConfig } from "./config/environment";
import { disconnectPrisma } from "./config/prisma";
import { createLogger } from "./utils/logger";

const logger = createLogger("Server");

async function startServer() {
  try {
    validateConfig();
    logger.info("Configuration validated successfully");

    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info(
        `Server running in ${config.env} mode on port ${config.port}`
      );
      logger.info(
        `API available at http://localhost:${config.port}${config.apiPrefix}`
      );
      logger.info(`Health check at http://localhost:${config.port}/health`);
      logger.info(`API docs at http://localhost:${config.port}/api-docs`);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, closing server gracefully...`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await disconnectPrisma();
          process.exit(0);
        } catch (error) {
          logger.error("Error during shutdown:", error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error(
          "Could not close connections in time, forcefully shutting down"
        );
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", error);
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      gracefulShutdown("UNHANDLED_REJECTION");
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
