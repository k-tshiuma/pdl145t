import knex from 'knex';
import path from 'path';
const db = knex({ client: 'sqlite3', connection: { filename: path.resolve(__dirname, 'data/pdl145t.db') }, useNullAsDefault: true });
async function main() {
  const res = await db('sqlite_master').where('name', 'like', '%territor%').select('*');
  console.log(res);
  await db.destroy();
}
main();
