import { Request, Response, NextFunction } from 'express';
import { RoleName } from '../models';
import { hasPermission } from '../auth/permissions';
import { AuthorizationError, AuthenticationError } from '../utils/errors';

/**
 * Middleware RBAC — vérifie que l'utilisateur a les droits nécessaires.
 *
 * @param category - Catégorie de permission (births, parents, certificates, users, audit, sync)
 * @param action - Action dans la catégorie (create, read, validate, etc.)
 */
export function requirePermission(category: string, action: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError());
    }

    const { roleName } = req.user;

    if (!hasPermission(roleName as RoleName, category as any, action)) {
      return next(
        new AuthorizationError(
          `Accès refusé — le rôle "${roleName}" ne peut pas effectuer l'action "${action}" sur "${category}"`
        )
      );
    }

    next();
  };
}

/**
 * Middleware pour les routes réservées à des rôles spécifiques.
 */
export function requireRoles(...roles: RoleName[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError());
    }

    if (!roles.includes(req.user.roleName as RoleName)) {
      return next(
        new AuthorizationError(
          `Accès réservé aux rôles : ${roles.join(', ')}`
        )
      );
    }

    next();
  };
}
