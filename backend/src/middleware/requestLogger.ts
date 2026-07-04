import morgan from 'morgan';
import { env } from '../config/env';

export const requestLogger = morgan(env.nodeEnv === 'development' ? 'dev' : 'combined');
