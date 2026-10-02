import * as xlsx from 'xlsx';
import knex from 'knex';
import config from './src/database/knexfile';
import path from 'path';

async function main() {
  const db = knex({
    ...config.development,
    connection: {
      filename: path.resolve(__dirname, 'data/pdl145t.db')
    }
  });

  // Read excel
  const filePath = path.resolve(__dirname, '../provinces_et_territoires.xlsx');
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[];
  
  // 1. Create tables
  const hasProvince = await db.schema.hasTable('province');
  if (!hasProvince) {
    await db.schema.createTable('province', table => {
      table.integer('province_id').primary();
      table.text('province_name');
    });
    console.log('Created table: province');
  }

  const hasTerritoire = await db.schema.hasTable('territoire');
  if (!hasTerritoire) {
    await db.schema.createTable('territoire', table => {
      table.string('territoire_id').primary();
      table.integer('province_id').references('province_id').inTable('province');
      table.text('territoire_name');
    });
    console.log('Created table: territoire');
  }

  // 2. Prepare data
  const provincesMap = new Map();
  const territoires = [];

  for (const row of data) {
    if (row.province_id) {
      provincesMap.set(row.province_id, {
        province_id: row.province_id,
        province_name: row.province_name
      });
    }

    if (row.territoire_id) {
      territoires.push({
        territoire_id: row.territoire_id,
        territoire_name: row.territoire_name,
        province_id: row.province_id
      });
    }
  }

  const provinces = Array.from(provincesMap.values());

  // 3. Insert data
  await db('territoire').del();
  await db('province').del();

  await db('province').insert(provinces);
  
  const chunkSize = 50;
  for (let i = 0; i < territoires.length; i += chunkSize) {
    await db('territoire').insert(territoires.slice(i, i + chunkSize));
  }

  console.log(`Successfully inserted ${provinces.length} provinces and ${territoires.length} territoires into the database.`);
  
  await db.destroy();
}

main().catch(console.error);
