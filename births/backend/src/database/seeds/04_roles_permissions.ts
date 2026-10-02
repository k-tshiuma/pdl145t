import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed 04 — Rôles et permissions (7 rôles provisoires)
 * ⚠️ La matrice des permissions doit être validée par les autorités compétentes.
 */
export async function seed(knex: Knex): Promise<void> {
  await knex('roles').del();

  const now = new Date().toISOString();

  const roles = [
    {
      id: uuidv4(),
      name: 'AGENT_SANTE',
      description: 'Agent de santé — Saisie des dossiers dans son centre de santé',
      permissions: JSON.stringify({
        births: { create: true, read: 'own_center', validate: false, correct: false, cancel: false },
        parents: { create: true, read: 'own_center', update: true },
        certificates: { generate: true, validate: false, download: true },
        users: { create: false, read: false, update: false, deactivate: false },
        audit: { read: false },
        sync: { push: true, resolveConflicts: false },
      }),
      created_at: now,
    },
    {
      id: uuidv4(),
      name: 'SAGE_FEMME',
      description: 'Sage-femme — Saisie des dossiers et examens médicaux',
      permissions: JSON.stringify({
        births: { create: true, read: 'own_center', validate: false, correct: false, cancel: false },
        parents: { create: true, read: 'own_center', update: true },
        certificates: { generate: true, validate: false, download: true },
        users: { create: false, read: false, update: false, deactivate: false },
        audit: { read: false },
        sync: { push: true, resolveConflicts: false },
      }),
      created_at: now,
    },
    {
      id: uuidv4(),
      name: 'SUPERVISEUR_ZONE',
      description: 'Superviseur de zone — Lecture et validation au niveau territoire',
      permissions: JSON.stringify({
        births: { create: false, read: 'territory', validate: true, correct: true, cancel: true },
        parents: { create: false, read: 'territory', update: false },
        certificates: { generate: false, validate: true, download: true },
        users: { create: false, read: true, update: false, deactivate: false },
        audit: { read: 'territory' },
        sync: { push: false, resolveConflicts: true },
      }),
      created_at: now,
    },
    {
      id: uuidv4(),
      name: 'ADMIN_PROVINCIAL',
      description: 'Administrateur provincial — Gestion de la province',
      permissions: JSON.stringify({
        births: { create: false, read: 'province', validate: true, correct: true, cancel: true },
        parents: { create: false, read: 'province', update: true },
        certificates: { generate: false, validate: true, download: true },
        users: { create: true, read: true, update: true, deactivate: false },
        audit: { read: 'province' },
        sync: { push: false, resolveConflicts: true },
      }),
      created_at: now,
    },
    {
      id: uuidv4(),
      name: 'ADMIN_NATIONAL',
      description: 'Administrateur national — Accès complet',
      permissions: JSON.stringify({
        births: { create: true, read: 'national', validate: true, correct: true, cancel: true },
        parents: { create: true, read: 'national', update: true },
        certificates: { generate: true, validate: true, download: true },
        users: { create: true, read: true, update: true, deactivate: true },
        audit: { read: 'national' },
        sync: { push: true, resolveConflicts: true },
      }),
      created_at: now,
    },
    {
      id: uuidv4(),
      name: 'AUDITEUR',
      description: 'Auditeur — Lecture seule des journaux et dossiers',
      permissions: JSON.stringify({
        births: { create: false, read: 'national', validate: false, correct: false, cancel: false },
        parents: { create: false, read: 'national', update: false },
        certificates: { generate: false, validate: false, download: true },
        users: { create: false, read: true, update: false, deactivate: false },
        audit: { read: 'national' },
        sync: { push: false, resolveConflicts: false },
      }),
      created_at: now,
    },
    {
      id: uuidv4(),
      name: 'OFFICIER_ETAT_CIVIL',
      description: 'Officier d\'état civil — Validation légale des actes de naissance',
      permissions: JSON.stringify({
        births: { create: false, read: 'territory', validate: true, correct: true, cancel: false },
        parents: { create: false, read: 'territory', update: false },
        certificates: { generate: false, validate: true, download: true },
        users: { create: false, read: false, update: false, deactivate: false },
        audit: { read: false },
        sync: { push: false, resolveConflicts: false },
      }),
      created_at: now,
    },
  ];

  await knex('roles').insert(roles);
}
