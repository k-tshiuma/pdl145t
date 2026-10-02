import { Request, Response, NextFunction } from 'express';
import { AppError, formatErrorResponse } from '../utils/errors';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

/**
 * Middleware de gestion centralisée des erreurs.
 * Doit être enregistré en DERNIER dans Express (après toutes les routes).
 *
 * Formate toutes les erreurs en réponse JSON standardisée.
 */
export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Erreur de validation Zod
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const key = e.path.join('.');
      if (!details[key]) details[key] = [];
      details[key].push(e.message);
    });

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Données invalides',
        details,
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }

  // Erreur métier connue
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(`[${err.code}] ${err.message}`, { path: req.path, stack: err.stack });
    } else {
      logger.warn(`[${err.code}] ${err.message}`, { path: req.path });
    }

    res.status(err.statusCode).json(formatErrorResponse(err, req));
    return;
  }

  // Erreur inattendue
  logger.error('Erreur interne non gérée', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Une erreur interne est survenue. Veuillez contacter le support.',
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  });
}

/**
 * Middleware 404 — Route introuvable.
 */
export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route introuvable : ${req.method} ${req.path}`,
    },
    timestamp: new Date().toISOString(),
  });
}
