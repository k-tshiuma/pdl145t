import knex from 'knex';
import path from 'path';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, './src/database/../../../backend/data/pdl145t.db')
  },
  useNullAsDefault: true
});

async function run() {
  try {
    const start = '2026-08-31T21:00:00.000Z';
    const end = '2026-09-30T20:59:59.999Z';
    
    console.log("Testing pdl145t.db with start:", start, "end:", end);
    const result = await db('births')
        .where('created_at', '>=', start)
        .andWhere('created_at', '<=', end)
        .count('* as count')
        .first();
    console.log("Query Result:", result);

    const raw = await db('births').select('created_at').limit(3);
    console.log("Sample rows:", raw);
  } catch(e) {
    console.error(e);
  } finally {
    db.destroy();
  }
}
run();
