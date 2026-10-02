import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../database/connection';
import { startOfMonth, endOfMonth } from 'date-fns';

export class DashboardController {
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const db = getDatabase();
      
      // Calculer les bornes du mois en cours
      const now = new Date();
      const start = startOfMonth(now).toISOString();
      const end = endOfMonth(now).toISOString();

      // 1. Naissances ce mois
      const birthsResult = await db('births')
        .where('created_at', '>=', start)
        .andWhere('created_at', '<=', end)
        .count('* as count')
        .first();
      const birthsCount = birthsResult ? Number(birthsResult.count) : 0;

      // 2. Parents enregistrés (pères et mères associés aux naissances du mois)
      const parentsResult = await db.raw(`
        SELECT COUNT(DISTINCT parent_id) as count FROM (
          SELECT c.father_id as parent_id FROM births b
          JOIN children c ON b.child_id = c.id
          WHERE b.created_at >= ? AND b.created_at <= ? AND c.father_id IS NOT NULL
          UNION
          SELECT c.mother_id as parent_id FROM births b
          JOIN children c ON b.child_id = c.id
          WHERE b.created_at >= ? AND b.created_at <= ? AND c.mother_id IS NOT NULL
        ) as unique_parents
      `, [start, end, start, end]);
      
      let parentsCount = 0;
      if (parentsResult && Array.isArray(parentsResult) && parentsResult.length > 0) {
        parentsCount = Number(parentsResult[0].count);
      } else if (parentsResult && parentsResult.count !== undefined) {
        // According to sqlite3 driver, sometimes raw result is directly the array, or object
        parentsCount = Number(parentsResult.count);
      }

      // 3. Actes générés (PENDING_VALIDATION)
      const generatedResult = await db('birth_certificates as bc')
        .join('births as b', 'bc.birth_id', 'b.id')
        .where('b.created_at', '>=', start)
        .andWhere('b.created_at', '<=', end)
        .andWhere('bc.status', 'PENDING_VALIDATION')
        .count('* as count')
        .first();
      const generatedCount = generatedResult ? Number(generatedResult.count) : 0;

      // 4. En attente (DRAFT)
      const draftResult = await db('birth_certificates as bc')
        .join('births as b', 'bc.birth_id', 'b.id')
        .where('b.created_at', '>=', start)
        .andWhere('b.created_at', '<=', end)
        .andWhere('bc.status', 'DRAFT')
        .count('* as count')
        .first();
      const draftCount = draftResult ? Number(draftResult.count) : 0;

      res.json({
        success: true,
        data: {
          birthsThisMonth: birthsCount,
          parentsRegistered: parentsCount,
          certificatesGenerated: generatedCount,
          certificatesDraft: draftCount
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
