import { BaseRepository } from './BaseRepository.js';
import { User, SafeUser } from '../models/User.js';
import { COLLECTIONS } from '../schemas/schema.js';
import { getDb, aql } from '../services/db.js';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(COLLECTIONS.USERS);
  }
  
  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const db = getDb();
    const cursor = await db.query(aql`
      FOR user IN ${this.collection}
      FILTER user.email == ${email}
      LIMIT 1
      RETURN user
    `);
    const users = await cursor.all();
    return users.length ? users[0] as User : null;
  }
  
  /**
   * Get a user with their orders
   */
  async getUserWithOrders(userKey: string): Promise<SafeUser & { orders: any[] }> {
    const db = getDb();
    const cursor = await db.query(aql`
      FOR user IN ${this.collection}
      FILTER user._key == ${userKey}
      LET orders = (
        FOR order, edge IN 1..1 OUTBOUND CONCAT(${COLLECTIONS.USERS}, "/", user._key) ${COLLECTIONS.USER_ORDERS}
        RETURN {
          order,
          purchaseDate: edge.purchaseDate
        }
      )
      RETURN MERGE(
        UNSET(user, "password"),
        { orders }
      )
    `);
    
    const result = await cursor.all();
    if (!result.length) {
      throw new Error(`User with key ${userKey} not found`);
    }
    
    return result[0] as SafeUser & { orders: any[] };
  }
} 