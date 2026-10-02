import knex from 'knex';
import path from 'path';
import * as xlsx from 'xlsx';

const db = knex({
  client: 'sqlite3',
  connection: { filename: path.resolve(__dirname, 'data/pdl145t.db') },
  useNullAsDefault: true
});

async function main() {
  await db.raw('PRAGMA foreign_keys = OFF');

  await db.schema.dropTableIfExists('territoire');
  await db.schema.dropTableIfExists('province');

  await db.schema.createTable('province', table => {
    table.string('province_id').primary();
    table.text('province_name');
  });

  await db.schema.createTable('territoire', table => {
    table.string('territoire_id').primary();
    table.string('province_id'); // Just string, no FK for a moment to avoid issues
    table.text('territoire_name');
  });

  // Load from provinces_et_territoires.xlsx
  const file1 = path.resolve(__dirname, '../provinces_et_territoires.xlsx');
  const wb1 = xlsx.readFile(file1);
  const data1 = xlsx.utils.sheet_to_json(wb1.Sheets[wb1.SheetNames[0]]) as any[];

  // Load from provinces.xlsx
  const file2 = path.resolve(__dirname, '../provinces.xlsx');
  const wb2 = xlsx.readFile(file2);
  const data2 = xlsx.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]]) as any[];

  // Map old_id to new province_id
  const idMap = new Map();
  for (const row of data2) {
    if (row.old_id && row.province_id) {
      idMap.set(row.old_id, row.province_id);
    }
  }

  const provincesMap = new Map();
  const territoires = [];

  for (const row of data1) {
    const oldProvId = row.province_id;
    const newProvId = idMap.get(oldProvId) || oldProvId; // fallback if not found

    if (row.province_id) {
      provincesMap.set(newProvId, {
        province_id: newProvId,
        province_name: row.province_name
      });
    }

    if (row.territoire_id) {
      territoires.push({
        territoire_id: row.territoire_id,
        province_id: newProvId,
        territoire_name: row.territoire_name
      });
    }
  }

  await db('province').insert(Array.from(provincesMap.values()));
  
  const chunkSize = 50;
  for (let i = 0; i < territoires.length; i += chunkSize) {
    await db('territoire').insert(territoires.slice(i, i + chunkSize));
  }

  console.log(`Recreated and populated tables with mapped UUIDs.`);
  await db.raw('PRAGMA foreign_keys = ON');
  await db.destroy();
}

main().catch(console.error);
