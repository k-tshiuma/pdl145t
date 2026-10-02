import { Request } from 'express';

/**
 * Classe de base pour toutes les erreurs métier de l'application.
 * Utilisée par le middleware d'erreur central pour formater les réponses HTTP.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 — Données invalides ou manquantes */
export class ValidationError extends AppError {
  public readonly details: Record<string, string[]>;
  constructor(message: string, details: Record<string, string[]> = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/** 401 — Non authentifié */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentification requise') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/** 403 — Non autorisé (authentifié mais accès refusé) */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Accès refusé') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/** 404 — Ressource introuvable */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} introuvable`, 404, 'NOT_FOUND');
  }
}

/** 409 — Conflit (doublon, état incompatible) */
export class ConflictError extends AppError {
  public readonly conflictingId?: string;
  constructor(message: string, conflictingId?: string) {
    super(message, 409, 'CONFLICT');
    this.conflictingId = conflictingId;
  }
}

/** 423 — Compte verrouillé */
export class AccountLockedError extends AppError {
  constructor(lockedUntil: Date) {
    super(
      `Compte verrouillé jusqu'à ${lockedUntil.toISOString()}`,
      423,
      'ACCOUNT_LOCKED'
    );
  }
}

/** 503 — Service temporairement indisponible */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporairement indisponible') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

/** Formate une erreur en réponse JSON standardisée */
export function formatErrorResponse(error: AppError, req?: Request) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error instanceof ValidationError && { details: error.details }),
      ...(error instanceof ConflictError && error.conflictingId && {
        conflictingId: error.conflictingId,
      }),
    },
    timestamp: new Date().toISOString(),
    path: req?.path,
  };
}
