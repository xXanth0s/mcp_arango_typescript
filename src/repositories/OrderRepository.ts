import { BaseRepository } from './BaseRepository.js';
import { Order, OrderItem, UserOrder } from '../models/Order.js';
import { COLLECTIONS } from '../schemas/schema.js';
import { getDb, aql } from '../services/db.js';

export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super(COLLECTIONS.ORDERS);
  }
  
  /**
   * Get an order with its items
   */
  async getOrderWithItems(orderKey: string): Promise<Order & { items: any[] }> {
    const db = getDb();
    const cursor = await db.query(aql`
      FOR order IN ${this.collection}
      FILTER order._key == ${orderKey}
      LET items = (
        FOR item, edge IN 1..1 OUTBOUND CONCAT(${COLLECTIONS.ORDERS}, "/", order._key) ${COLLECTIONS.ORDER_ITEMS}
        RETURN {
          item,
          amount: edge.amount
        }
      )
      RETURN MERGE(order, { items })
    `);
    
    const result = await cursor.all();
    if (!result.length) {
      throw new Error(`Order with key ${orderKey} not found`);
    }
    
    return result[0] as Order & { items: any[] };
  }
  
  /**
   * Create a new order with items
   */
  async createOrderWithItems(
    userId: string,
    orderData: Partial<Order>,
    items: Array<{ itemId: string, amount: number }>
  ): Promise<Order> {
    const db = getDb();
    
    // Create the order
    const now = new Date().toISOString();
    const order = {
      ...orderData,
      orderDate: orderData.orderDate || now,
      status: orderData.status || 'pending',
      createdAt: now,
      updatedAt: now,
      totalAmount: 0 // Will be updated later
    };
    
    // Save the order
    const orderCursor = await db.query(aql`
      INSERT ${order} INTO ${this.collection}
      RETURN NEW
    `);
    const orderDoc = await orderCursor.next();
    
    // Create edge from user to order
    const userOrderEdge = {
      _from: `${COLLECTIONS.USERS}/${userId}`,
      _to: orderDoc._id,
      purchaseDate: now
    };
    
    await db.query(aql`
      INSERT ${userOrderEdge} INTO ${db.collection(COLLECTIONS.USER_ORDERS)}
    `);
    
    // Process each item
    let totalAmount = 0;
    
    for (const item of items) {
      // Get the item to calculate price
      const itemCursor = await db.query(aql`
        FOR item IN ${db.collection(COLLECTIONS.ITEMS)}
        FILTER item._key == ${item.itemId}
        RETURN item
      `);
      const itemDoc = await itemCursor.next();
      
      // Update item stock
      await db.query(aql`
        UPDATE { _key: ${item.itemId} }
        WITH { stock: ${itemDoc.stock - item.amount} }
        IN ${db.collection(COLLECTIONS.ITEMS)}
      `);
      
      // Create edge from order to item
      const orderItemEdge = {
        _from: orderDoc._id,
        _to: `${COLLECTIONS.ITEMS}/${item.itemId}`,
        amount: item.amount
      };
      
      await db.query(aql`
        INSERT ${orderItemEdge} INTO ${db.collection(COLLECTIONS.ORDER_ITEMS)}
      `);
      
      // Add to order total
      totalAmount += itemDoc.price * item.amount;
    }
    
    // Update order with total amount
    const updatedOrderCursor = await db.query(aql`
      UPDATE { _key: ${orderDoc._key} }
      WITH { totalAmount: ${totalAmount} }
      IN ${this.collection}
      RETURN NEW
    `);
    
    const result = await updatedOrderCursor.next();
    return result as Order;
  }
  
  /**
   * Find orders by status
   */
  async findByStatus(status: Order['status']): Promise<Order[]> {
    const db = getDb();
    const cursor = await db.query(aql`
      FOR order IN ${this.collection}
      FILTER order.status == ${status}
      RETURN order
    `);
    return await cursor.all() as Order[];
  }
  
  /**
   * Update order status
   */
  async updateStatus(orderKey: string, status: Order['status']): Promise<Order> {
    const db = getDb();
    const now = new Date().toISOString();
    const cursor = await db.query(aql`
      UPDATE { _key: ${orderKey} }
      WITH { status: ${status}, updatedAt: ${now} }
      IN ${this.collection}
      RETURN NEW
    `);
    
    const result = await cursor.all();
    if (!result.length) {
      throw new Error(`Order with key ${orderKey} not found`);
    }
    
    return result[0] as Order;
  }
} 