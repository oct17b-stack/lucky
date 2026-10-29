import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';
import * as schema from './schema.ts';

export { schema };

/** 用网站共用的连接池创建 Drizzle 实例 */
export function createDb(pool: Pool) {
  return drizzle(pool, { schema });
}

export type Db = ReturnType<typeof createDb>;
