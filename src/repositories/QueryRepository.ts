import { getDb, aql } from '../services/db.js';


export const executeQuery = async <T>(query: string, params: Record<string, any> = {}): Promise<T[]> => {
  const db = getDb();
  const cursor = await db.query(query, params);
  return await cursor.all() as T[];
}
export class QueryRepository {
  /**
   * Execute a custom AQL query with parameters
   */
  async executeQuery<T>(query: string, params: Record<string, any> = {}): Promise<T[]> {
    const db = getDb();
    const cursor = await db.query(query, params);
    return await cursor.all() as T[];
  }
  
  /**
   * Execute a custom AQL query using the template tag
   */
  async execute<T>(queryFn: () => any): Promise<T[]> {
    const db = getDb();
    const cursor = await db.query(queryFn());
    return await cursor.all() as T[];
  }
  
  /**
   * Find recent orders with their items
   */
  async getRecentOrdersWithItems(limit: number = 10): Promise<any[]> {
    const db = getDb();
    const cursor = await db.query(aql`
      FOR order IN orders
      SORT order.orderDate DESC
      LIMIT ${limit}
      LET items = (
        FOR item, edge IN 1..1 OUTBOUND order order_items
        RETURN {
          item: item,
          amount: edge.amount
        }
      )
      LET user = FIRST(
        FOR user, edge IN 1..1 INBOUND order user_orders
        RETURN {
          _id: user._id,
          _key: user._key,
          name: user.name,
          email: user.email,
          purchaseDate: edge.purchaseDate
        }
      )
      RETURN {
        order: order,
        items: items,
        user: user
      }
    `);
    
    return await cursor.all();
  }
  
  /**
   * Get user purchase history with detailed information
   */
  async getUserPurchaseHistory(userKey: string): Promise<any[]> {
    const db = getDb();
    const cursor = await db.query(aql`
      FOR user IN users
      FILTER user._key == ${userKey}
      
      FOR order, userOrderEdge IN 1..1 OUTBOUND user user_orders
        LET items = (
          FOR item, orderItemEdge IN 1..1 OUTBOUND order order_items
          RETURN {
            name: item.name,
            sku: item.sku,
            price: item.price,
            amount: orderItemEdge.amount,
            subtotal: item.price * orderItemEdge.amount
          }
        )
        
        LET totalAmount = SUM(
          FOR item IN items
          RETURN item.subtotal
        )
        
        RETURN {
          orderId: order._id,
          orderKey: order._key,
          purchaseDate: userOrderEdge.purchaseDate,
          status: order.status,
          items: items,
          totalAmount: totalAmount
        }
    `);
    
    return await cursor.all();
  }
  
  /**
   * Get popular items based on order quantity
   */
  async getPopularItems(limit: number = 10): Promise<any[]> {
    const db = getDb();
    const cursor = await db.query(aql`
      FOR item IN items
        LET orderCount = LENGTH(
          FOR orderItem IN order_items
          FILTER orderItem._to == item._id
          RETURN 1
        )
        
        LET totalSold = SUM(
          FOR orderItem IN order_items
          FILTER orderItem._to == item._id
          RETURN orderItem.amount
        )
        
        FILTER orderCount > 0
        SORT totalSold DESC
        LIMIT ${limit}
        
        RETURN {
          _key: item._key,
          name: item.name,
          sku: item.sku,
          price: item.price,
          orderCount: orderCount,
          totalSold: totalSold
        }
    `);
    
    return await cursor.all();
  }
} 