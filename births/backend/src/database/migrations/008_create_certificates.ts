import type { Knex } from 'knex';

/**
 * Migration 008 — Actes de naissance
 *
 * ⚠️ AVERTISSEMENT LÉGAL :
 * Le document PDF généré est un PRÉ-ENREGISTREMENT.
 * Il ne constitue PAS un acte de naissance juridiquement valable.
 * La valeur juridique, le format officiel et la procédure de validation
 * doivent être définis par les autorités de l'état civil compétentes
 * conformément à la Loi n°87-010 du 1er août 1987 (Code de la famille RDC).
 *
 * Le statut CERTIFIED ne doit être utilisé qu'après validation officielle.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('birth_certificates', (table) => {
    table.text('id').primary();
    table.text('birth_id').notNullable().unique()
      .references('id').inTable('births').onDelete('CASCADE');

    // ⚠️ Format du numéro de certificat à valider par l'autorité compétente
    table.text('certificate_number').unique();

    table.text('pdf_path'); // Chemin relatif vers le fichier PDF généré
    table.text('pdf_hash'); // SHA-256 pour vérification d'intégrité

    // ⚠️ QR code : autorisé uniquement si validé par l'autorité compétente
    table.text('qr_code_data');

    table.text('status').notNullable().defaultTo('DRAFT')
      .checkIn(['DRAFT', 'PENDING_VALIDATION', 'CERTIFIED', 'REJECTED', 'CANCELLED']);

    // ⚠️ legal_status : distinction entre document système et acte légal
    table.text('legal_status').notNullable().defaultTo('PRE_REGISTRATION')
      .checkIn(['PRE_REGISTRATION', 'SUBMITTED', 'LEGALLY_VALIDATED']);

    table.text('issued_by').references('id').inTable('users').onDelete('SET NULL');
    table.datetime('issued_at');
    table.text('validated_by'); // Officier d'état civil (peut être externe au système)
    table.datetime('validated_at');
    table.text('rejection_reason');
    table.text('notes');

    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());

    table.index(['birth_id']);
    table.index(['status']);
    table.index(['legal_status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('birth_certificates');
}
