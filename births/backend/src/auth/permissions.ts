import { RoleName, RolePermissions } from '../models';

/**
 * Matrice RBAC — Permissions par rôle.
 *
 * ⚠️ PROVISOIRE — À valider conjointement par :
 *   - Ministère de la Santé (données médicales)
 *   - Ministère de l'Intérieur (données d'état civil)
 *   - Ministère de la Justice (accès aux actes)
 *   - Ministère de la Défense (si applicable)
 */
export const ROLE_PERMISSIONS: Record<RoleName, RolePermissions> = {
  AGENT_SANTE: {
    births: {
      create: true,
      read: 'own_center',
      validate: false,
      correct: false,
      cancel: false,
    },
    parents: {
      create: true,
      read: 'own_center',
      update: true,
    },
    certificates: {
      generate: true,
      validate: false,
      download: true,
    },
    users: {
      create: false,
      read: false,
      update: false,
      deactivate: false,
    },
    audit: {
      read: false,
    },
    sync: {
      push: true,
      resolveConflicts: false,
    },
  },

  SAGE_FEMME: {
    births: {
      create: true,
      read: 'own_center',
      validate: false,
      correct: false,
      cancel: false,
    },
    parents: {
      create: true,
      read: 'own_center',
      update: true,
    },
    certificates: {
      generate: true,
      validate: false,
      download: true,
    },
    users: {
      create: false,
      read: false,
      update: false,
      deactivate: false,
    },
    audit: {
      read: false,
    },
    sync: {
      push: true,
      resolveConflicts: false,
    },
  },

  SUPERVISEUR_ZONE: {
    births: {
      create: false,
      read: 'territory',
      validate: true,
      correct: true,
      cancel: true,
    },
    parents: {
      create: false,
      read: 'territory',
      update: false,
    },
    certificates: {
      generate: false,
      validate: true,
      download: true,
    },
    users: {
      create: false,
      read: true,
      update: false,
      deactivate: false,
    },
    audit: {
      read: 'territory',
    },
    sync: {
      push: false,
      resolveConflicts: true,
    },
  },

  ADMIN_PROVINCIAL: {
    births: {
      create: false,
      read: 'province',
      validate: true,
      correct: true,
      cancel: true,
    },
    parents: {
      create: false,
      read: 'province',
      update: true,
    },
    certificates: {
      generate: false,
      validate: true,
      download: true,
    },
    users: {
      create: true,
      read: true,
      update: true,
      deactivate: false,
    },
    audit: {
      read: 'province',
    },
    sync: {
      push: false,
      resolveConflicts: true,
    },
  },

  ADMIN_NATIONAL: {
    births: {
      create: true,
      read: 'national',
      validate: true,
      correct: true,
      cancel: true,
    },
    parents: {
      create: true,
      read: 'national',
      update: true,
    },
    certificates: {
      generate: true,
      validate: true,
      download: true,
    },
    users: {
      create: true,
      read: true,
      update: true,
      deactivate: true,
    },
    audit: {
      read: 'national',
    },
    sync: {
      push: true,
      resolveConflicts: true,
    },
  },

  AUDITEUR: {
    births: {
      create: false,
      read: 'national',
      validate: false,
      correct: false,
      cancel: false,
    },
    parents: {
      create: false,
      read: 'national',
      update: false,
    },
    certificates: {
      generate: false,
      validate: false,
      download: true,
    },
    users: {
      create: false,
      read: true,
      update: false,
      deactivate: false,
    },
    audit: {
      read: 'national',
    },
    sync: {
      push: false,
      resolveConflicts: false,
    },
  },

  OFFICIER_ETAT_CIVIL: {
    births: {
      create: false,
      read: 'territory',
      validate: true,
      correct: true,
      cancel: false,
    },
    parents: {
      create: false,
      read: 'territory',
      update: false,
    },
    certificates: {
      generate: false,
      validate: true, // Validation légale officielle
      download: true,
    },
    users: {
      create: false,
      read: false,
      update: false,
      deactivate: false,
    },
    audit: {
      read: false,
    },
    sync: {
      push: false,
      resolveConflicts: false,
    },
  },
};

/**
 * Retourne les permissions d'un rôle donné.
 */
export function getPermissions(roleName: RoleName): RolePermissions {
  return ROLE_PERMISSIONS[roleName];
}

/**
 * Vérifie si un rôle a une permission spécifique.
 */
export function hasPermission(
  roleName: RoleName,
  category: keyof RolePermissions,
  action: string
): boolean {
  const perms = ROLE_PERMISSIONS[roleName];
  const categoryPerms = perms[category] as Record<string, unknown>;
  const value = categoryPerms[action];
  return value !== false && value !== undefined;
}
