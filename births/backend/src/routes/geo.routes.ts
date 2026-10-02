import { Router } from 'express';
import { getDatabase } from '../database/connection';
import { authMiddleware } from '../middleware/auth.middleware';

export function createGeoRoutes(): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/provinces', async (_req, res, next) => {
    try {
      const db = getDatabase();
      const provinces = await db('provinces').orderBy('name');
      res.json({ success: true, data: provinces });
    } catch (err) {
      next(err);
    }
  });

  router.get('/provinces/:id/territories', async (req, res, next) => {
    try {
      const db = getDatabase();
      const territories = await db('territories')
        .where('province_id', req.params.id)
        .orderBy('name');
      res.json({ success: true, data: territories });
    } catch (err) {
      next(err);
    }
  });

  router.get('/territories/:id/communes', async (req, res, next) => {
    try {
      const db = getDatabase();
      const communes = await db('communes_sectors')
        .where('territory_id', req.params.id)
        .orderBy('name');
      res.json({ success: true, data: communes });
    } catch (err) {
      next(err);
    }
  });

  router.get('/communes/:id/villages', async (req, res, next) => {
    try {
      const db = getDatabase();
      const villages = await db('villages_quarters')
        .where('commune_sector_id', req.params.id)
        .orderBy('name');
      res.json({ success: true, data: villages });
    } catch (err) {
      next(err);
    }
  });

  router.get('/health-centers', async (req, res, next) => {
    try {
      const db = getDatabase();
      let qb = db('health_centers').where({ is_active: 1 });
      if (req.query.territory_id) {
        qb = qb.where('territory_id', req.query.territory_id as string);
      }
      const centers = await qb.orderBy('name');
      res.json({ success: true, data: centers });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
