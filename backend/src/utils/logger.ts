import winston from 'winston';
import { env } from '../config/env';

export const logger = winston.createLogger({
  level: env.nodeEnv === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    env.nodeEnv === 'development'
      ? winston.format.combine(winston.format.colorize(), winston.format.simple())
      : winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});
