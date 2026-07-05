import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    logger.warn(`${err.code} on ${req.method} ${req.path}: ${err.message}`);
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    return;
  }

  const message = err instanceof Error ? err.message : 'Unknown error';
  logger.error(`Unhandled error on ${req.method} ${req.path}: ${message}`, {
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.nodeEnv === 'development' ? message : 'Something went wrong',
    },
  });
}
