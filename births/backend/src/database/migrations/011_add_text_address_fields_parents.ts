import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('parents', (table) => {
    table.text('address_quarter_village');
    table.text('address_commune_sector');
    table.text('address_territory');
    table.text('address_city');
    table.text('address_province');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('parents', (table) => {
    table.dropColumn('address_quarter_village');
    table.dropColumn('address_commune_sector');
    table.dropColumn('address_territory');
    table.dropColumn('address_city');
    table.dropColumn('address_province');
  });
}
