import { Router } from 'express';
import { BirthsController } from '../controllers/births.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export function createBirthRoutes(controller: BirthsController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.post('/draft', controller.createDraft);
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.put('/:id/draft', controller.updateDraft);
  router.post('/:id/confirm', controller.confirm);
  router.get('/:id/certificate', controller.getCertificate);
  router.get('/:id/certificate/pdf', controller.downloadCertificatePDF);

  return router;
}
