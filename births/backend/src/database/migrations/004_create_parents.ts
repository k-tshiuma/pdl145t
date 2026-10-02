import type { Knex } from 'knex';

/**
 * Migration 004 — Parents (Père et Mère)
 *
 * Un parent peut être enregistré sans NNI (cas fréquent en zone rurale).
 * ⚠️ La procédure applicable aux parents sans pièce d'identité
 *    doit être validée par l'autorité compétente.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('parents', (table) => {
    table.text('id').primary();

    // Identité nationale — nullable car parent peut ne pas avoir de CIN
    // ⚠️ Format NNI (9 chiffres) à confirmer officiellement
    table.text('nin'); // Numéro d'Identification Nationale

    table.text('first_names').notNullable();
    table.text('last_name').notNullable();
    table.text('post_names');
    table.date('birth_date');
    table.text('gender').checkIn(['M', 'F']);
    table.text('civil_status').checkIn(['marie', 'celibataire', 'divorce', 'veuf']);

    // Coordonnées
    table.text('email');
    table.text('phone');
    table.text('profession');

    // Adresse hiérarchique
    table.text('address_avenue');
    table.text('address_number');
    table.text('village_quarter_id').references('id').inTable('villages_quarters').onDelete('SET NULL');
    table.text('commune_sector_id').references('id').inTable('communes_sectors').onDelete('SET NULL');
    table.text('territory_id').references('id').inTable('territories').onDelete('SET NULL');
    table.text('province_id').references('id').inTable('provinces').onDelete('SET NULL');

    // Traçabilité
    table.text('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.text('updated_by').references('id').inTable('users').onDelete('SET NULL');

    // Synchronisation offline-first
    table.text('sync_status').notNullable().defaultTo('LOCAL')
      .checkIn(['LOCAL', 'PENDING', 'SYNCED', 'CONFLICT']);
    table.text('local_id'); // ID généré sur le device avant sync

    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());

    // Contrainte d'unicité sur NNI (si fourni)
    // SQLite : la contrainte unique sur NULL n'est pas appliquée aux valeurs NULL
    table.unique(['nin']);
  });

  // Index pour la recherche
  await knex.schema.table('parents', (table) => {
    table.index(['nin']);
    table.index(['last_name']);
    table.index(['sync_status']);
    table.index(['created_by']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('parents');
}
