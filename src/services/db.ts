import { Database, aql } from 'arangojs';
import { DB_CONFIG } from '../schemas/schema.js';

// Singleton instance for database connection
let dbInstance: Database | null = null;

/**
 * Gets the database instance and creates one if it doesn't exist
 */
export const getDb = (): Database => {
  if (!dbInstance) {
    dbInstance = new Database({
      url: DB_CONFIG.url,
      auth: {
        username: DB_CONFIG.auth.username,
        password: DB_CONFIG.auth.password
      },
      databaseName: DB_CONFIG.name
    });
  }
  return dbInstance;
};

/**
 * Reset database instance, useful for testing
 */
export const resetDb = (): void => {
  dbInstance = null;
};

// Export aql for convenience
export { aql }; 