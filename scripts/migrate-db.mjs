import pg from 'pg';
import { readFile } from 'node:fs/promises';
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL before running db:migrate.');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query('BEGIN');
  await client.query("SELECT pg_advisory_xact_lock(hashtext('themovie-schema-v1'))");
  await client.query(await readFile(new URL('../db/001_account_storage.sql', import.meta.url), 'utf8'));
  await client.query('COMMIT');
  console.log('Account and feedback schema is ready.');
} catch(error) { await client.query('ROLLBACK'); throw error; }
finally { await client.end(); }
