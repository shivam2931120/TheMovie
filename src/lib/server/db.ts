import 'server-only';
import { Pool } from 'pg';
const globalDb = globalThis as unknown as { moviePool?: Pool };
export function database() {
    if (!process.env.DATABASE_URL) throw new Error('Database unavailable');
    if (!globalDb.moviePool) {
        globalDb.moviePool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000 });
        globalDb.moviePool.on('error', () => console.error('Database connection unavailable'));
    }
    return globalDb.moviePool;
}
