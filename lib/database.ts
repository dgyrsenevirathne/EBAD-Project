import sql from 'mssql';
import { sqlConfig } from '@/config/database';

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool || pool.connected === false) {
    pool = await sql.connect(sqlConfig);
  }
  return pool;
}
