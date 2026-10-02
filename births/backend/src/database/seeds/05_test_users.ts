import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

/**
 * Seed 05 — Utilisateurs de test
 * Un utilisateur par rôle. Mot de passe : Test1234!
 *
 * ⚠️ Ces comptes sont UNIQUEMENT pour le développement et les tests.
 * Changer les mots de passe et désactiver les comptes de test avant toute mise en production.
 */
export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();

  const passwordHash = await bcrypt.hash('Test1234!', 12);
  const now = new Date().toISOString();

  // Récupérer les IDs des rôles
  const roles = await knex('roles').select('id', 'name');
  const roleMap = Object.fromEntries(roles.map(r => [r.name, r.id]));

  // Récupérer un centre de santé pour les agents
  const healthCenter = await knex('health_centers').first();
  const province = await knex('provinces').where('code', 'KIN').first();
  const territory = await knex('territories').where('province_id', province?.id).first();

  const users = [
    {
      id: uuidv4(),
      username: 'agent.test',
      email: 'agent.test@pdl145t.cd',
      password_hash: passwordHash,
      first_name: 'Jean',
      last_name: 'Mukendi',
      role_id: roleMap['AGENT_SANTE'],
      health_center_id: healthCenter?.id ?? null,
      province_id: province?.id ?? null,
      territory_id: territory?.id ?? null,
      is_active: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      username: 'sage.femme.test',
      email: 'sage.femme@pdl145t.cd',
      password_hash: passwordHash,
      first_name: 'Marie',
      last_name: 'Kabila',
      role_id: roleMap['SAGE_FEMME'],
      health_center_id: healthCenter?.id ?? null,
      province_id: province?.id ?? null,
      territory_id: territory?.id ?? null,
      is_active: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      username: 'superviseur.test',
      email: 'superviseur@pdl145t.cd',
      password_hash: passwordHash,
      first_name: 'Paul',
      last_name: 'Kasongo',
      role_id: roleMap['SUPERVISEUR_ZONE'],
      province_id: province?.id ?? null,
      territory_id: territory?.id ?? null,
      is_active: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      username: 'admin.national.test',
      email: 'admin@pdl145t.cd',
      password_hash: passwordHash,
      first_name: 'Admin',
      last_name: 'National',
      role_id: roleMap['ADMIN_NATIONAL'],
      is_active: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      username: 'auditeur.test',
      email: 'audit@pdl145t.cd',
      password_hash: passwordHash,
      first_name: 'Sophie',
      last_name: 'Ngoma',
      role_id: roleMap['AUDITEUR'],
      is_active: 1,
      created_at: now,
      updated_at: now,
    },
  ];

  await knex('users').insert(users);

  console.log('✅ Comptes de test créés :');
  users.forEach(u => console.log(`   - ${u.username} (${roles.find(r => r.id === u.role_id)?.name}) — Mot de passe : Test1234!`));
}
