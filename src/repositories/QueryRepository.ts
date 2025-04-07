import { getDb, aql } from '../services/db.js';


export const executeQuery = async <T>(query: string, params: Record<string, any> = {}): Promise<T[]> => {
  const db = getDb();
  const cursor = await db.query(query, params);
  return await cursor.all() as T[];
}