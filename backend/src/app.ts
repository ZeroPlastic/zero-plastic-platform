import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import rootRoute from './routes/root.route';
import healthRoute from './routes/health.route';
import dbHealthRoute from './routes/dbHealth.route';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/', rootRoute);
app.use('/health', healthRoute);
app.use('/db-health', dbHealthRoute);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Must be registered last — Express recognizes it as error-handling middleware by its 4-argument signature.
app.use(errorHandler);

export default app;
