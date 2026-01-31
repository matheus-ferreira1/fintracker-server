import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { logger } from './lib/logger.js';
import authRouter from './auth/auth.router.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use((req, _res, next) => {
    logger.info({
      method: req.method,
      path: req.path,
      query: req.query,
    }, 'Incoming request');
    next();
  });

  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/v1/auth', authRouter);

  app.use(errorHandler);

  return app;
}
