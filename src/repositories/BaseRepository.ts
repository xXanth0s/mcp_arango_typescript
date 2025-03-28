import { getDb, aql } from '../services/db.js';

export class BaseRepository<T> {
  protected collection: any;
  
  constructor(collectionName: string) {
    const db = getDb();
    this.collection = db.collection(collectionName);
  }
  
  /**
   * Find a document by its key
   */
  async findByKey(key: string): Promise<T | null> {
    try {
      const doc = await this.collection.document(key);
      return doc as T;
    } catch (error) {
      if ((error as any).code === 404) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Find all documents in the collection
   */
  async findAll(): Promise<T[]> {
    const db = getDb();
    const cursor = await db.query(aql`
      FOR doc IN ${this.collection}
      RETURN doc
    `);
    return await cursor.all() as T[];
  }
  
  /**
   * Create a new document
   */
  async create(data: Partial<T>): Promise<T> {
    const doc = await this.collection.save(data as any);
    return { ...data, _key: doc._key, _id: doc._id, _rev: doc._rev } as T;
  }
  
  /**
   * Update an existing document
   */
  async update(key: string, data: Partial<T>): Promise<T> {
    const doc = await this.collection.update(key, data as any, { returnNew: true });
    return doc.new as T;
  }
  
  /**
   * Delete a document
   */
  async delete(key: string): Promise<boolean> {
    try {
      await this.collection.remove(key);
      return true;
    } catch (error) {
      if ((error as any).code === 404) {
        return false;
      }
      throw error;
    }
  }
  
  /**
   * Run a custom AQL query
   */
  async query<R>(queryFunc: () => any): Promise<R[]> {
    const db = getDb();
    const cursor = await db.query(queryFunc());
    return await cursor.all() as R[];
  }
} 