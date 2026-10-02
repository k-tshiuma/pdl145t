import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
  await knex('territories').del();

  const kinshasa = await knex('provinces').where('code', 'KIN').first();
  const sudKivu = await knex('provinces').where('code', 'SDK').first();
  const katanga = await knex('provinces').where('code', 'HKA').first();

  const now = new Date().toISOString();
  const territories = [
    // Kinshasa (ville-province — secteurs)
    { id: uuidv4(), name: 'Funa', code: 'KIN-FUN', province_id: kinshasa?.id, created_at: now },
    { id: uuidv4(), name: 'Lukunga', code: 'KIN-LUK', province_id: kinshasa?.id, created_at: now },
    { id: uuidv4(), name: 'Mont-Amba', code: 'KIN-MON', province_id: kinshasa?.id, created_at: now },
    { id: uuidv4(), name: 'Tshangu', code: 'KIN-TSH', province_id: kinshasa?.id, created_at: now },
    // Sud-Kivu
    { id: uuidv4(), name: 'Bukavu', code: 'SDK-BUK', province_id: sudKivu?.id, created_at: now },
    { id: uuidv4(), name: 'Kabare', code: 'SDK-KAB', province_id: sudKivu?.id, created_at: now },
    // Haut-Katanga
    { id: uuidv4(), name: 'Lubumbashi', code: 'HKA-LUB', province_id: katanga?.id, created_at: now },
    { id: uuidv4(), name: 'Kipushi', code: 'HKA-KIP', province_id: katanga?.id, created_at: now },
  ].filter(t => t.province_id);

  if (territories.length > 0) {
    await knex('territories').insert(territories);
  }
}
