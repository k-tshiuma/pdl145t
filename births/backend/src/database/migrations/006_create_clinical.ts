import type { Knex } from 'knex';

/**
 * Migration 006 — Examens cliniques et Dépistages
 *
 * ⚠️ AVERTISSEMENT MÉDICAL :
 * Aucun seuil clinique n'est codé en dur dans ce schéma.
 * L'interprétation des résultats (Apgar, bilirubine, oxymétrie, etc.)
 * est de la responsabilité exclusive du professionnel de santé.
 * Les protocoles médicaux doivent être validés par le Ministère de la Santé RDC.
 */
export async function up(knex: Knex): Promise<void> {
  // Examen clinique principal (un par naissance)
  await knex.schema.createTable('clinical_examinations', (table) => {
    table.text('id').primary();
    table.text('birth_id').notNullable().unique()
      .references('id').inTable('births').onDelete('CASCADE');

    // Score d'Apgar — ⚠️ seuils à valider par le Ministère de la Santé
    table.integer('apgar_1min'); // 0-10
    table.integer('apgar_5min'); // 0-10
    table.text('apgar_notes');

    // Examen physique complet
    table.integer('physical_exam_done').notNullable().defaultTo(0);
    table.datetime('physical_exam_datetime');
    table.text('physical_exam_professional');
    table.text('physical_exam_results');
    table.text('physical_exam_notes');

    // Groupe sanguin — ⚠️ Résultats bruts uniquement, pas d'interprétation système
    table.text('blood_group').checkIn(['A', 'B', 'AB', 'O', 'UNKNOWN']);
    table.text('blood_rhesus').checkIn(['POS', 'NEG', 'UNKNOWN']);
    table.text('blood_status').notNullable().defaultTo('NOT_DONE')
      .checkIn(['DONE', 'NOT_DONE', 'UNKNOWN']);

    // Oxymétrie de pouls — ⚠️ protocole à valider officiellement
    table.integer('pulse_oximetry_done').notNullable().defaultTo(0);
    table.float('pulse_oximetry_value'); // % SpO2
    table.text('pulse_oximetry_notes');

    // Traçabilité
    table.text('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.text('updated_by').references('id').inTable('users').onDelete('SET NULL');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
  });

  /**
   * Table de dépistages (plusieurs par naissance)
   * Types : GUTHRIE, AUDITORY, BILIRUBIN, OTHER
   *
   * ⚠️ Tous les protocoles de dépistage néonatal doivent être
   *    validés par le Ministère de la Santé RDC avant déploiement.
   */
  await knex.schema.createTable('screenings', (table) => {
    table.text('id').primary();
    table.text('birth_id').notNullable()
      .references('id').inTable('births').onDelete('CASCADE');

    table.text('type').notNullable()
      .checkIn(['GUTHRIE', 'AUDITORY', 'BILIRUBIN', 'OTHER']);

    table.integer('done').notNullable().defaultTo(0);
    table.datetime('screening_datetime');
    table.text('method');  // Méthode utilisée
    table.text('result');  // Résultat brut (texte libre)

    // Pour les valeurs numériques (ex: bilirubine)
    table.float('value');
    table.text('unit'); // ex: mg/dL, µmol/L

    table.text('notes');
    table.text('professional'); // Professionnel ayant réalisé le dépistage

    table.text('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.datetime('created_at').defaultTo(knex.fn.now());

    table.index(['birth_id']);
    table.index(['type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('screenings');
  await knex.schema.dropTableIfExists('clinical_examinations');
}
