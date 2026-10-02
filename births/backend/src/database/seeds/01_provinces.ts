import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed 01 — 26 Provinces officielles de la République Démocratique du Congo
 * Source : découpage administratif officiel RDC
 */
export async function seed(knex: Knex): Promise<void> {
  await knex('provinces').del();

  const provinces = [
    { id: uuidv4(), name: 'Kinshasa', code: 'KIN' },
    { id: uuidv4(), name: 'Kongo-Central', code: 'KOC' },
    { id: uuidv4(), name: 'Kwango', code: 'KWA' },
    { id: uuidv4(), name: 'Kwilu', code: 'KWI' },
    { id: uuidv4(), name: 'Mai-Ndombe', code: 'MAI' },
    { id: uuidv4(), name: 'Kasaï', code: 'KAS' },
    { id: uuidv4(), name: 'Kasaï-Central', code: 'KAC' },
    { id: uuidv4(), name: 'Kasaï-Oriental', code: 'KAO' },
    { id: uuidv4(), name: 'Lomami', code: 'LOM' },
    { id: uuidv4(), name: 'Sankuru', code: 'SAN' },
    { id: uuidv4(), name: 'Maniema', code: 'MAN' },
    { id: uuidv4(), name: 'Sud-Kivu', code: 'SDK' },
    { id: uuidv4(), name: 'Nord-Kivu', code: 'NDK' },
    { id: uuidv4(), name: 'Ituri', code: 'ITU' },
    { id: uuidv4(), name: 'Haut-Uélé', code: 'HUE' },
    { id: uuidv4(), name: 'Bas-Uélé', code: 'BUE' },
    { id: uuidv4(), name: 'Tshopo', code: 'TSH' },
    { id: uuidv4(), name: 'Mongala', code: 'MON' },
    { id: uuidv4(), name: 'Nord-Ubangi', code: 'NUB' },
    { id: uuidv4(), name: 'Sud-Ubangi', code: 'SUB' },
    { id: uuidv4(), name: 'Équateur', code: 'EQU' },
    { id: uuidv4(), name: 'Tshuapa', code: 'TSU' },
    { id: uuidv4(), name: 'Tanganyika', code: 'TAN' },
    { id: uuidv4(), name: 'Haut-Lomami', code: 'HLO' },
    { id: uuidv4(), name: 'Lualaba', code: 'LUA' },
    { id: uuidv4(), name: 'Haut-Katanga', code: 'HKA' },
  ].map(p => ({ ...p, created_at: new Date().toISOString() }));

  await knex('provinces').insert(provinces);
}
