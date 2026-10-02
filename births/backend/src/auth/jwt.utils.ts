import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticationError } from '../utils/errors';
import { RoleName } from '../models';

export interface JWTPayload {
  userId: string;
  username: string;
  roleId: string;
  roleName: RoleName;
  healthCenterId: string | null;
  provinceId: string | null;
  territoryId: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Génère un token JWT d'accès (durée courte : 8h par défaut).
 */
export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    issuer: 'pdl145t',
    audience: 'pdl145t-app',
  });
}

/**
 * Génère un token JWT de rafraîchissement (durée longue : 7 jours).
 */
export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    issuer: 'pdl145t',
  });
}

/**
 * Vérifie et décode un token d'accès.
 * @throws AuthenticationError si le token est invalide ou expiré.
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'pdl145t',
      audience: 'pdl145t-app',
    }) as JWTPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Session expirée — veuillez vous reconnecter');
    }
    throw new AuthenticationError('Token invalide');
  }
}

/**
 * Vérifie et décode un refresh token.
 */
export function verifyRefreshToken(token: string): { userId: string } {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'pdl145t',
    }) as { userId: string };
  } catch {
    throw new AuthenticationError('Token de rafraîchissement invalide ou expiré');
  }
}
