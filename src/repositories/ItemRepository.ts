import { BaseRepository } from './BaseRepository.js';
import { Item } from '../models/Item.js';
import { COLLECTIONS } from '../schemas/schema.js';
import { getDb, aql } from '../services/db.js';

export class ItemRepository extends BaseRepository<Item> {
  constructor() {
    super(COLLECTIONS.ITEMS);
  }
  
  /**
   * Find an item by SKU
   */
  async findBySku(sku: string): Promise<Item | null> {
    const db = getDb();
    const cursor = await db.query(aql`
      FOR item IN ${this.collection}
      FILTER item.sku == ${sku}
      LIMIT 1
      RETURN item
    `);
    const items = await cursor.all();
    return items.length ? items[0] as Item : null;
  }
  
  /**
   * Find items by name or partial name
   */
  async findByName(name: string): Promise<Item[]> {
    const db = getDb();
    const cursor = await db.query(aql`
      FOR item IN ${this.collection}
      FILTER CONTAINS(LOWER(item.name), LOWER(${name}))
      RETURN item
    `);
    return await cursor.all() as Item[];
  }
  
  /**
   * Find items that are low in stock
   */
  async findLowStock(threshold: number = 10): Promise<Item[]> {
    const db = getDb();
    const cursor = await db.query(aql`
      FOR item IN ${this.collection}
      FILTER item.stock <= ${threshold}
      RETURN item
    `);
    return await cursor.all() as Item[];
  }
} 