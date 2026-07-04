import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from './middleware/requestLogger';
import rootRoute from './routes/root.route';
import healthRoute from './routes/health.route';
import dbHealthRoute from './routes/dbHealth.route';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/', rootRoute);
app.use('/health', healthRoute);
app.use('/db-health', dbHealthRoute);

export default app;
