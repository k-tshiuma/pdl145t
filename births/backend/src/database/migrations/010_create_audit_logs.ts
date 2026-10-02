import type { Knex } from 'knex';

/**
 * Migration 010 — Journaux d'audit
 *
 * Table IMMUABLE : INSERT uniquement, jamais UPDATE ou DELETE.
 * Toute action sur les données sensibles doit être journalisée.
 *
 * Conformité : les exigences légales de rétention des journaux d'audit
 * en RDC doivent être vérifiées par l'autorité compétente.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('audit_logs', (table) => {
    table.text('id').primary();

    // Utilisateur (text simple, pas FK — pour conserver les logs même si user supprimé)
    table.text('user_id');
    table.text('username'); // Dénormalisé pour lisibilité même si user supprimé

    // Action effectuée
    table.text('action').notNullable();
    // ex: LOGIN, LOGOUT, CREATE_PARENT, UPDATE_BIRTH, GENERATE_CERTIFICATE,
    //     VIEW_SENSITIVE, DELETE_RECORD, SYNC_COMPLETE, CONFLICT_DETECTED

    // Entité concernée
    table.text('entity_type');
    // ex: parent, child, birth, certificate, user, sync_queue

    table.text('entity_id');

    // Données avant/après (JSON) — null si non applicable
    table.text('old_values'); // JSON stringifié
    table.text('new_values'); // JSON stringifié

    // Contexte technique
    table.text('ip_address');
    table.text('user_agent');
    table.text('request_id'); // Pour corréler les requêtes
    table.text('health_center_id'); // Centre de santé depuis lequel l'action a été effectuée

    // Résultat
    table.text('result').defaultTo('SUCCESS')
      .checkIn(['SUCCESS', 'FAILURE', 'PARTIAL']);
    table.text('error_message');

    table.datetime('created_at').defaultTo(knex.fn.now());

    // Index pour les requêtes d'audit fréquentes
    table.index(['user_id']);
    table.index(['action']);
    table.index(['entity_type', 'entity_id']);
    table.index(['created_at']);
    table.index(['health_center_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
}
