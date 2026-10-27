import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export function createPgAdapter() {
  const pool = new Pool({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 5432,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    ssl:
      process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
  });

  const adapter = new PrismaPg(pool);

  return { adapter, pool };
}
