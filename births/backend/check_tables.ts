import knex from 'knex';
import path from 'path';

const db = knex({
  client: 'sqlite3',
  connection: { filename: path.resolve(__dirname, 'data/pdl145t.db') },
  useNullAsDefault: true
});

async function main() {
  const tables = await db('sqlite_master').where('type', 'table').select('name');
  console.log('Tables:', tables);
  await db.destroy();
}
main().catch(console.error);
