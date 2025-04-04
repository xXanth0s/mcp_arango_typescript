import { Database, aql } from 'arangojs';
import { COLLECTIONS } from '../schemas/schema.js';
import 'dotenv/config';

// Load environment variables
const ARANGO_URL = process.env.ARANGO_URL || 'http://localhost:8530';
const ARANGO_DB_NAME = process.env.ARANGO_DB_NAME || 'shop_db';
const ARANGO_USERNAME = process.env.ARANGO_USERNAME || 'root';
const ARANGO_PASSWORD = process.env.ARANGO_PASSWORD || 'rootpassword';

// Singleton instance for database connection
let dbInstance: Database | null = null;

/**
 * Gets the database instance and creates one if it doesn't exist
 */
export const getDb = (databaseName?: string): Database => {
  if (!dbInstance) {
    dbInstance = new Database({
      url: ARANGO_URL,
      auth: {
        username: ARANGO_USERNAME,
        password: ARANGO_PASSWORD
      },
      databaseName: databaseName || ARANGO_DB_NAME
    });
    console.log(`Connected to ArangoDB at ${ARANGO_URL}, database: ${ARANGO_DB_NAME}`);
  }
  return dbInstance;
};

/**
 * Reset database instance, useful for testing
 */
export const resetDb = (): void => {
  dbInstance = null;
};

// Export collections and aql for convenience
export { COLLECTIONS, aql }; 