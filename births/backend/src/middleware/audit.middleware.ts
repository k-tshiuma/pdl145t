import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/connection';
import { logger } from '../utils/logger';

/**
 * Middleware d'audit automatique.
 * Journalise toutes les opérations mutantes (POST, PUT, PATCH, DELETE)
 * sur les entités sensibles.
 */
export function auditMiddleware(req: Request, _res: Response, next: NextFunction): void {
  // Ajouter un request ID pour la corrélation des logs
  req.requestId = uuidv4();

  // Journaliser les requêtes mutantes uniquement
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const db = getDatabase();
    const logId = uuidv4();
    const now = new Date().toISOString();

    // Insertion asynchrone — ne bloque pas la requête
    db('audit_logs').insert({
      id: logId,
      user_id: req.user?.userId ?? null,
      username: req.user?.username ?? null,
      action: `${req.method} ${req.path}`,
      entity_type: extractEntityType(req.path),
      ip_address: req.ip ?? req.socket?.remoteAddress ?? null,
      user_agent: req.headers['user-agent'] ?? null,
      request_id: req.requestId,
      health_center_id: req.user?.healthCenterId ?? null,
      result: 'SUCCESS',
      created_at: now,
    }).catch((err: Error) => {
      logger.warn('Échec de journalisation audit (non bloquant)', { error: err.message });
    });
  }

  next();
}

/**
 * Dérive le type d'entité depuis le chemin de l'URL.
 */
function extractEntityType(path: string): string | null {
  const segments = path.split('/').filter(Boolean);
  const entityMap: Record<string, string> = {
    parents: 'parent',
    children: 'child',
    births: 'birth',
    clinical: 'clinical_examination',
    vaccines: 'vaccine',
    care: 'care',
    certificates: 'birth_certificate',
    users: 'user',
    sync: 'sync_queue',
  };

  for (const seg of segments) {
    if (entityMap[seg]) return entityMap[seg];
  }
  return null;
}
