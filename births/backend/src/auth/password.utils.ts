import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hache un mot de passe en utilisant bcrypt (12 rounds).
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Compare un mot de passe en clair avec son hash.
 */
export async function comparePassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

/**
 * Vérifie la complexité minimale d'un mot de passe.
 * Règles : min 8 caractères, 1 majuscule, 1 chiffre.
 */
export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (password.length < 8) {
    return { valid: false, reason: 'Le mot de passe doit contenir au moins 8 caractères' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  return { valid: true };
}
