import type { Knex } from 'knex';

/**
 * Migration 005 — Enfants et Naissances
 *
 * Chaque naissance est composée de :
 * - children : les données personnelles de l'enfant
 * - births : le dossier d'enregistrement (workflow, statut, centre)
 *
 * system_id : ⚠️ identifiant temporaire généré par le système.
 *   Le format officiel d'identification des enfants doit être défini
 *   et validé par l'autorité compétente avant la mise en production.
 */
export async function up(knex: Knex): Promise<void> {
  // Enfants
  await knex.schema.createTable('children', (table) => {
    table.text('id').primary();

    // ⚠️ system_id : format provisoire — À valider par l'autorité compétente
    table.text('system_id').unique(); // Assigné après validation du dossier

    table.text('first_names').notNullable();
    table.text('last_name').notNullable();
    table.text('post_names');
    table.datetime('birth_datetime').notNullable();
    table.text('birth_place');
    table.text('gender').checkIn(['M', 'F', 'INDETERMINE']);

    // Type de naissance
    table.text('birth_type').notNullable().defaultTo('SINGLE')
      .checkIn(['SINGLE', 'TWIN', 'TRIPLET', 'OTHER']);
    table.integer('birth_order').defaultTo(1); // Pour les jumeaux/triplés

    // Liens parentaux — nullable pour cas particuliers (père/mère inconnu)
    table.text('father_id').references('id').inTable('parents').onDelete('SET NULL');
    table.text('mother_id').references('id').inTable('parents').onDelete('SET NULL');

    // ⚠️ Cas père/mère inconnu : procédure à valider par l'autorité compétente
    table.integer('father_unknown').notNullable().defaultTo(0);
    table.integer('mother_unknown').notNullable().defaultTo(0);
    table.text('father_unknown_reason'); // Décès, abandon, non déclaré...
    table.text('mother_unknown_reason');

    // Traçabilité
    table.text('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.text('updated_by').references('id').inTable('users').onDelete('SET NULL');

    // Synchronisation offline-first
    table.text('sync_status').notNullable().defaultTo('LOCAL')
      .checkIn(['LOCAL', 'PENDING', 'SYNCED', 'CONFLICT']);
    table.text('local_id');

    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.table('children', (table) => {
    table.index(['father_id']);
    table.index(['mother_id']);
    table.index(['birth_datetime']);
    table.index(['sync_status']);
  });

  // Dossiers de naissance (workflow)
  await knex.schema.createTable('births', (table) => {
    table.text('id').primary();
    table.text('child_id').notNullable().unique()
      .references('id').inTable('children').onDelete('CASCADE');
    table.text('health_center_id').notNullable()
      .references('id').inTable('health_centers').onDelete('RESTRICT');
    table.text('registered_by').notNullable()
      .references('id').inTable('users').onDelete('RESTRICT');

    table.text('status').notNullable().defaultTo('DRAFT')
      .checkIn(['DRAFT', 'IN_PROGRESS', 'VALIDATED', 'CANCELLED']);

    table.text('validated_by').references('id').inTable('users').onDelete('SET NULL');
    table.datetime('validated_at');
    table.text('cancellation_reason');

    // Champ libre pour stocker le brouillon JSON pendant la saisie progressive
    table.text('draft_data');

    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.table('births', (table) => {
    table.index(['child_id']);
    table.index(['health_center_id']);
    table.index(['registered_by']);
    table.index(['status']);
    table.index(['validated_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('births');
  await knex.schema.dropTableIfExists('children');
}
