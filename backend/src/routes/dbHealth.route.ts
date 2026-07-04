import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      database: 'Connected',
    });
  } catch {
    res.status(503).json({
      status: 'ERROR',
      database: 'Disconnected',
    });
  }
});

export default router;
