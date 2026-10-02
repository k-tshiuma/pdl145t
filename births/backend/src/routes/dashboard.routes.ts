import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export function createDashboardRoutes(controller: DashboardController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/stats', controller.getStats);

  return router;
}
