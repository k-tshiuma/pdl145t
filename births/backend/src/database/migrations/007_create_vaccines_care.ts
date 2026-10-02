import type { Knex } from 'knex';

/**
 * Migration 007 — Vaccins et Soins initiaux
 *
 * ⚠️ IMPORTANT :
 * La Vitamine K et la pommade ophtalmique sont des SOINS PRÉVENTIFS
 * et non des vaccins. Ils sont stockés dans une table séparée `care`.
 *
 * ⚠️ Les protocoles médicaux (doses, produits, délais) doivent être
 *    validés par le Ministère de la Santé RDC avant déploiement.
 */
export async function up(knex: Knex): Promise<void> {
  // Vaccins (Hépatite B, et autres vaccins futurs)
  await knex.schema.createTable('vaccines', (table) => {
    table.text('id').primary();
    table.text('birth_id').notNullable()
      .references('id').inTable('births').onDelete('CASCADE');

    table.text('vaccine_type').notNullable()
      .checkIn(['HEPATITIS_B', 'BCG', 'OTHER']);

    table.integer('administered').notNullable().defaultTo(0);
    table.datetime('administered_at');
    table.text('professional'); // Professionnel ayant administré
    table.text('health_center_id').references('id').inTable('health_centers').onDelete('SET NULL');
    table.text('batch_number'); // Numéro de lot (traçabilité pharmacovigilance)
    table.text('notes');
    table.text('non_administration_reason'); // Si non administré

    table.text('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.datetime('created_at').defaultTo(knex.fn.now());

    table.index(['birth_id']);
    table.index(['vaccine_type']);
  });

  /**
   * Soins préventifs — DISTINCTS des vaccins
   * Types : VITAMIN_K (soin préventif), OPHTHALMIC_OINTMENT, OTHER
   */
  await knex.schema.createTable('care', (table) => {
    table.text('id').primary();
    table.text('birth_id').notNullable()
      .references('id').inTable('births').onDelete('CASCADE');

    // ⚠️ VITAMIN_K n'est PAS un vaccin — c'est un soin préventif
    table.text('care_type').notNullable()
      .checkIn(['VITAMIN_K', 'OPHTHALMIC_OINTMENT', 'OTHER']);

    table.integer('administered').notNullable().defaultTo(0);
    table.datetime('administered_at');
    table.text('product'); // Nom du produit utilisé
    table.text('notes');
    table.text('non_administration_reason');

    table.text('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.datetime('created_at').defaultTo(knex.fn.now());

    table.index(['birth_id']);
    table.index(['care_type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('care');
  await knex.schema.dropTableIfExists('vaccines');
}
