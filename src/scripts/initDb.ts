import { getDb } from '../services/db.js';
import { COLLECTIONS, GRAPH, INDEXES, DB_CONFIG } from '../schemas/schema.js';

/**
 * Initializes the database and creates all required collections and indexes
 */
async function initializeDatabase(): Promise<void> {
  const db = getDb();
  
  try {
    // Check if database exists, if not create it
    const dbList = await db.listDatabases();
    if (!dbList.includes(DB_CONFIG.name)) {
      console.log(`Creating database: ${DB_CONFIG.name}`);
      await db.createDatabase(DB_CONFIG.name);
    }
    
    console.log(`Using database: ${DB_CONFIG.name}`);
    db.database(DB_CONFIG.name);
    
    // Create document collections
    for (const collection of [COLLECTIONS.USERS, COLLECTIONS.ITEMS, COLLECTIONS.ORDERS]) {
      if (!(await db.collections()).some(c => c.name === collection)) {
        console.log(`Creating document collection: ${collection}`);
        await db.createCollection(collection);
      }
    }
    
    // Create edge collections
    for (const collection of [COLLECTIONS.ORDER_ITEMS, COLLECTIONS.USER_ORDERS]) {
      if (!(await db.collections()).some(c => c.name === collection)) {
        console.log(`Creating edge collection: ${collection}`);
        await db.createEdgeCollection(collection);
      }
    }
    
    // Create graph
    const graphs = await db.listGraphs();
    if (!graphs.some(g => g.name === GRAPH.NAME)) {
      console.log(`Creating graph: ${GRAPH.NAME}`);
      const graph = db.graph(GRAPH.NAME);
      await graph.create(GRAPH.EDGE_DEFINITIONS);
    }
    
    // Create indexes
    for (const [collection, indexes] of Object.entries(INDEXES)) {
      const coll = db.collection(collection);
      
      // Get existing indexes to avoid recreating them
      const existingIndexes = await coll.indexes();
      const existingFields = existingIndexes.map(idx => 
        idx.fields ? idx.fields.sort().join(',') : ''
      );
      
      for (const indexDef of indexes) {
        const fieldKey = indexDef.fields.sort().join(',');
        if (!existingFields.includes(fieldKey)) {
          console.log(`Creating ${indexDef.type} index on ${collection}: ${fieldKey}`);
          
          // Create the appropriate index type
          await coll.ensureIndex({
            type: indexDef.type as any,
            fields: indexDef.fields,
            unique: indexDef.unique
          });
        }
      }
    }
    
    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Execute initialization
initializeDatabase(); 