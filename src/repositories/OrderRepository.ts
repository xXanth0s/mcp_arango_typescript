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
    
    // Start a transaction
    const result = await db.executeTransaction({
      collections: {
        write: [
          COLLECTIONS.ORDERS, 
          COLLECTIONS.ORDER_ITEMS, 
          COLLECTIONS.USER_ORDERS,
          COLLECTIONS.ITEMS
        ]
      },
      action: function(params) {
        const { userId, orderData, items, collections } = params;
        const db = require('@arangodb').db;
        
        // Create the order
        const now = new Date().toISOString();
        const order = {
          ...orderData,
          orderDate: orderData.orderDate || now,
          status: orderData.status || 'pending',
          createdAt: now,
          updatedAt: now
        };
        
        // Save the order
        const orderDoc = db[collections.ORDERS].save(order);
        const orderId = orderDoc._id;
        
        // Create edge from user to order
        const userOrderEdge = {
          _from: `${collections.USERS}/${userId}`,
          _to: orderId,
          purchaseDate: now
        };
        db[collections.USER_ORDERS].save(userOrderEdge);
        
        // Create edges from order to items and update stock
        let totalAmount = 0;
        for (const item of items) {
          // Get the item to calculate price
          const itemDoc = db[collections.ITEMS].document(item.itemId);
          
          // Update item stock
          db[collections.ITEMS].update(item.itemId, {
            stock: itemDoc.stock - item.amount
          });
          
          // Create edge from order to item
          const orderItemEdge = {
            _from: orderId,
            _to: `${collections.ITEMS}/${item.itemId}`,
            amount: item.amount
          };
          db[collections.ORDER_ITEMS].save(orderItemEdge);
          
          // Add to order total
          totalAmount += itemDoc.price * item.amount;
        }
        
        // Update order with total amount
        const updatedOrder = db[collections.ORDERS].update(orderDoc._key, {
          totalAmount
        }, { returnNew: true });
        
        return updatedOrder.new;
      },
      params: { userId, orderData, items, collections: COLLECTIONS }
    });
    
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