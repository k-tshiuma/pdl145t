import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
  await knex('health_centers').del();

  const now = new Date().toISOString();
  const funa = await knex('territories').where('code', 'KIN-FUN').first();
  const bukavu = await knex('territories').where('code', 'SDK-BUK').first();
  const lubumbashi = await knex('territories').where('code', 'HKA-LUB').first();

  const centers = [
    {
      id: uuidv4(),
      name: 'Centre de Santé de Référence Kinshasa — Test',
      code: 'CS-KIN-001',
      territory_id: funa?.id,
      address: 'Avenue de la Libération, No. 1, Kinshasa',
      phone: '+243810000001',
      director_name: 'Dr. Bienvenu Mboka',
      is_active: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      name: 'Hôpital Général de Référence Bukavu — Test',
      code: 'CS-BUK-001',
      territory_id: bukavu?.id,
      address: 'Avenue Patrice Lumumba, Bukavu',
      phone: '+243810000002',
      director_name: 'Dr. Aimée Mulumba',
      is_active: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuidv4(),
      name: 'Centre de Santé Lubumbashi Nord — Test',
      code: 'CS-LUB-001',
      territory_id: lubumbashi?.id,
      address: 'Boulevard du 30 Juin, Lubumbashi',
      phone: '+243810000003',
      director_name: 'Dr. Claude Tshimanga',
      is_active: 1,
      created_at: now,
      updated_at: now,
    },
  ].filter(c => c.territory_id);

  if (centers.length > 0) {
    await knex('health_centers').insert(centers);
  }
}
