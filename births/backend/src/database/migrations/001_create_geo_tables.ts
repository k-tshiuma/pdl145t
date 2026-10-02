import type { Knex } from 'knex';

/**
 * Migration 001 — Tables géographiques
 * Hiérarchie : Province → Territoire → Commune/Secteur → Village/Quartier
 */
export async function up(knex: Knex): Promise<void> {
  // Provinces de la RDC
  await knex.schema.createTable('provinces', (table) => {
    table.text('id').primary();
    table.text('name').notNullable();
    table.text('code').unique();
    table.datetime('created_at').defaultTo(knex.fn.now());
  });

  // Territoires (145 territoires au total en RDC)
  await knex.schema.createTable('territories', (table) => {
    table.text('id').primary();
    table.text('name').notNullable();
    table.text('code');
    table.text('province_id').notNullable().references('id').inTable('provinces').onDelete('RESTRICT');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.index(['province_id']);
  });

  // Communes et Secteurs
  await knex.schema.createTable('communes_sectors', (table) => {
    table.text('id').primary();
    table.text('name').notNullable();
    table.text('type').notNullable().checkIn(['commune', 'secteur', 'ville']);
    table.text('territory_id').notNullable().references('id').inTable('territories').onDelete('RESTRICT');
    table.index(['territory_id']);
  });

  // Villages et Quartiers
  await knex.schema.createTable('villages_quarters', (table) => {
    table.text('id').primary();
    table.text('name').notNullable();
    table.text('commune_sector_id').notNullable().references('id').inTable('communes_sectors').onDelete('RESTRICT');
    table.index(['commune_sector_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('villages_quarters');
  await knex.schema.dropTableIfExists('communes_sectors');
  await knex.schema.dropTableIfExists('territories');
  await knex.schema.dropTableIfExists('provinces');
}
