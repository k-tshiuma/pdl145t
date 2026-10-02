import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IAuditRepository } from '../repositories/interfaces/IAuditRepository';
import { comparePassword } from '../auth/password.utils';
import { signAccessToken, signRefreshToken, verifyRefreshToken, JWTPayload } from '../auth/jwt.utils';
import { AuthenticationError, AccountLockedError } from '../utils/errors';
import { RoleName } from '../models';
import { logger } from '../utils/logger';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    roleName: string;
    healthCenterId: string | null;
  };
}

export class AuthService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly auditRepo: IAuditRepository,
  ) {}

  /**
   * Authentifie un utilisateur et retourne une paire de tokens JWT.
   */
  async login(username: string, password: string, ipAddress?: string): Promise<LoginResult> {
    const user = await this.userRepo.findByUsername(username);

    if (!user) {
      // Ne pas révéler si l'utilisateur existe ou non
      throw new AuthenticationError('Identifiants incorrects');
    }

    if (!user.is_active) {
      throw new AuthenticationError('Compte désactivé — contactez votre administrateur');
    }

    // Vérifier le verrouillage du compte
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new AccountLockedError(new Date(user.locked_until));
    }

    const passwordMatch = await comparePassword(password, user.password_hash);

    if (!passwordMatch) {
      const attempts = await this.userRepo.incrementFailedAttempts(user.id);
      logger.warn(`Échec de connexion pour ${username} — tentative ${attempts}/${MAX_FAILED_ATTEMPTS}`);

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
        await this.userRepo.lockAccount(user.id, lockUntil);
        await this.auditRepo.create({
          user_id: user.id,
          username: user.username,
          action: 'ACCOUNT_LOCKED',
          ip_address: ipAddress,
          result: 'SUCCESS',
        });
        throw new AccountLockedError(lockUntil);
      }

      throw new AuthenticationError('Identifiants incorrects');
    }

    // Connexion réussie
    await this.userRepo.resetFailedAttempts(user.id);
    await this.userRepo.updateLastLogin(user.id);

    const userWithRole = await this.userRepo.findWithRole(user.id);
    if (!userWithRole) throw new AuthenticationError('Erreur interne d\'authentification');

    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      roleId: user.role_id,
      roleName: userWithRole.role.name as RoleName,
      healthCenterId: user.health_center_id,
      provinceId: user.province_id,
      territoryId: user.territory_id,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(user.id);

    await this.auditRepo.create({
      user_id: user.id,
      username: user.username,
      action: 'LOGIN',
      ip_address: ipAddress,
      health_center_id: user.health_center_id,
      result: 'SUCCESS',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        roleName: userWithRole.role.name,
        healthCenterId: user.health_center_id,
      },
    };
  }

  /**
   * Renouvelle un token d'accès à partir d'un refresh token valide.
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const { userId } = verifyRefreshToken(refreshToken);
    const userWithRole = await this.userRepo.findWithRole(userId);

    if (!userWithRole || !userWithRole.is_active) {
      throw new AuthenticationError('Compte invalide ou désactivé');
    }

    const payload: JWTPayload = {
      userId: userWithRole.id,
      username: userWithRole.username,
      roleId: userWithRole.role_id,
      roleName: userWithRole.role.name as RoleName,
      healthCenterId: userWithRole.health_center_id,
      provinceId: userWithRole.province_id,
      territoryId: userWithRole.territory_id,
    };

    return { accessToken: signAccessToken(payload) };
  }
}
