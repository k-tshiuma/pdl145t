import type { Knex } from 'knex';

/**
 * Migration 009 — File de synchronisation (offline-first)
 *
 * Toutes les opérations effectuées hors-ligne sont enregistrées
 * dans cette table et traitées lors du retour de la connexion.
 *
 * Stratégie de résolution des conflits :
 * - PENDING : en attente de traitement
 * - PROCESSING : en cours de traitement
 * - SYNCED : synchronisé avec succès
 * - FAILED : échec après N tentatives (retry_count)
 * - CONFLICT : conflit détecté, nécessite résolution manuelle
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('synchronization_queue', (table) => {
    table.text('id').primary();

    // Entité concernée
    table.text('entity_type').notNullable()
      .checkIn(['parent', 'child', 'birth', 'clinical_examination',
                'screening', 'vaccine', 'care', 'birth_certificate']);
    table.text('entity_id').notNullable();

    // Opération
    table.text('operation').notNullable()
      .checkIn(['CREATE', 'UPDATE', 'DELETE']);

    // Données complètes de l'entité (JSON)
    table.text('payload').notNullable(); // JSON stringifié

    // Statut de synchronisation
    table.text('status').notNullable().defaultTo('PENDING')
      .checkIn(['PENDING', 'PROCESSING', 'SYNCED', 'FAILED', 'CONFLICT']);

    table.integer('retry_count').notNullable().defaultTo(0);
    table.integer('max_retries').notNullable().defaultTo(3);
    table.text('error_message');
    table.text('conflict_data'); // Données du serveur en cas de conflit

    table.text('created_by'); // ID de l'agent qui a créé l'opération
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('processed_at');
    table.datetime('synced_at');

    table.index(['status']);
    table.index(['entity_type']);
    table.index(['entity_id']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('synchronization_queue');
}
