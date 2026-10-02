import type { Knex } from 'knex';

/**
 * Migration 002 — Rôles et Utilisateurs
 * Système RBAC (Role-Based Access Control)
 *
 * Rôles définis (provisoires — à valider par l'autorité compétente) :
 * - AGENT_SANTE : saisie, centre de santé unique
 * - SAGE_FEMME : saisie, centre de santé unique
 * - SUPERVISEUR_ZONE : lecture multi-centres, territoire
 * - ADMIN_PROVINCIAL : gestion province
 * - ADMIN_NATIONAL : accès complet
 * - AUDITEUR : lecture seule, logs
 * - OFFICIER_ETAT_CIVIL : validation légale actes
 */
export async function up(knex: Knex): Promise<void> {
  // Rôles avec permissions JSON
  await knex.schema.createTable('roles', (table) => {
    table.text('id').primary();
    table.text('name').notNullable().unique();
    table.text('description');
    table.text('permissions').notNullable().defaultTo('{}'); // JSON stringifié
    table.datetime('created_at').defaultTo(knex.fn.now());
  });

  // Utilisateurs
  await knex.schema.createTable('users', (table) => {
    table.text('id').primary();
    table.text('username').notNullable().unique();
    table.text('email').unique();
    table.text('password_hash').notNullable();
    table.text('first_name');
    table.text('last_name');
    table.text('role_id').notNullable().references('id').inTable('roles').onDelete('RESTRICT');
    // Périmètre géographique (nullable = accès national)
    table.text('health_center_id'); // FK ajouté après migration 003
    table.text('province_id').references('id').inTable('provinces').onDelete('SET NULL');
    table.text('territory_id').references('id').inTable('territories').onDelete('SET NULL');
    table.integer('is_active').notNullable().defaultTo(1);
    table.integer('failed_login_attempts').notNullable().defaultTo(0);
    table.datetime('locked_until');
    table.datetime('last_login');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.index(['username']);
    table.index(['role_id']);
    table.index(['health_center_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('roles');
}
