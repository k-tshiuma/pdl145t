import knex, { Knex } from 'knex';
import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { logger } from '../utils/logger';

let _db: Knex | null = null;

export function getDatabase(): Knex {
  if (_db) return _db;

  const dbDir = path.dirname(config.db.path);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    logger.info(`Répertoire de base de données créé : ${dbDir}`);
  }

  _db = knex({
    client: 'sqlite3',
    connection: {
      filename: config.db.path,
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn: any, done: (err: Error | null) => void) => {
        conn.run('PRAGMA journal_mode = WAL', () => {
          conn.run('PRAGMA foreign_keys = ON', () => {
            conn.run('PRAGMA synchronous = NORMAL', () => {
              conn.run('PRAGMA cache_size = -64000', done);
            });
          });
        });
      },
    },
  });

  logger.info(`Connexion SQLite établie : ${config.db.path}`);
  return _db;
}

export async function closeDatabase(): Promise<void> {
  if (_db) {
    await _db.destroy();
    _db = null;
    logger.info('Connexion SQLite fermée');
  }
}

export const db = new Proxy({} as Knex, {
  get(_target, prop) {
    return getDatabase()[prop as keyof Knex];
  },
});
