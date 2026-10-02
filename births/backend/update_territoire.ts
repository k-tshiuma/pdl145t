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

  // Read the new provinces data
  const filePath = path.resolve(__dirname, '../provinces.xlsx');
  const workbook = xlsx.readFile(filePath);
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any[];
  
  // Disable foreign keys temporarily
  await db.raw('PRAGMA foreign_keys = OFF');

  let updatedCount = 0;
  
  // Update both tables
  for (const row of data) {
    const oldId = row.old_id;
    const newId = row.province_id;

    if (oldId && newId) {
      // Update territoire table as explicitly requested
      const result = await db('territoire')
        .where('province_id', oldId)
        .update({ province_id: newId });
        
      updatedCount += result;

      // Update province table to keep data consistent
      await db('province')
        .where('province_id', oldId)
        .update({ province_id: newId });
    }
  }

  // Re-enable foreign keys
  await db.raw('PRAGMA foreign_keys = ON');

  console.log(`Updated ${updatedCount} rows in territoire table.`);
  
  await db.destroy();
}

main().catch(console.error);
