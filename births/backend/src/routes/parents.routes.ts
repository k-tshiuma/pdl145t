import { Router } from 'express';
import { ParentsController } from '../controllers/parents.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export function createParentRoutes(controller: ParentsController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', controller.search);
  router.post('/check-duplicate', controller.checkDuplicate);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.get('/:id/children', controller.getChildren);

  return router;
}
