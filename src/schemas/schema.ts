// Defines the database schema with collections and relationships for ArangoDB

export const COLLECTIONS = {
  // Document collections
  USERS: 'users',
  ITEMS: 'items',
  ORDERS: 'orders',
  
  // Edge collections
  ORDER_ITEMS: 'order_items', // Relationship between orders and items, includes amount
  USER_ORDERS: 'user_orders'  // Relationship between users and orders, includes date
};

export const GRAPH = {
  NAME: 'shop_graph',
  EDGE_DEFINITIONS: [
    {
      collection: COLLECTIONS.ORDER_ITEMS,
      from: [COLLECTIONS.ORDERS],
      to: [COLLECTIONS.ITEMS]
    },
    {
      collection: COLLECTIONS.USER_ORDERS,
      from: [COLLECTIONS.USERS],
      to: [COLLECTIONS.ORDERS]
    }
  ]
};

// Database and collection indexes
export const INDEXES = {
  [COLLECTIONS.USERS]: [
    { type: 'hash', fields: ['email'], unique: true }
  ],
  [COLLECTIONS.ITEMS]: [
    { type: 'hash', fields: ['sku'], unique: true },
    { type: 'persistent', fields: ['name'] }
  ],
  [COLLECTIONS.ORDERS]: [
    { type: 'persistent', fields: ['orderDate'] }
  ],
  [COLLECTIONS.ORDER_ITEMS]: [
    { type: 'persistent', fields: ['amount'] }
  ],
  [COLLECTIONS.USER_ORDERS]: [
    { type: 'persistent', fields: ['purchaseDate'] }
  ]
};

// Default database configuration
export const DB_CONFIG = {
  name: 'shop_db',
  url: 'http://localhost:8529',
  auth: {
    username: 'root',
    password: 'rootpassword'
  }
}; 