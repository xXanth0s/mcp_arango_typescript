import 'dotenv/config';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { COLLECTIONS } from '../schemas/schema.js';
import { getDb } from '../services/db.js';

// Load environment variables
const ARANGO_DB_NAME = process.env.ARANGO_DB_NAME || 'shop_db';

/**
 * Seeds the database with test data
 */
async function seedTestData(): Promise<void> {
  console.log('Starting database seed process...');
  try {
    // Connect to the database
    const db = getDb(ARANGO_DB_NAME);
    const now = new Date().toISOString();

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    for (const collection of Object.values(COLLECTIONS)) {
      const coll = db.collection(collection);
      if (await coll.exists()) {
        await coll.truncate();
      }
    }

    // Create test users
    console.log('Creating test users...');
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password456',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'password789',
        createdAt: now,
        updatedAt: now
      }
    ];

    const userCollection = db.collection(COLLECTIONS.USERS);
    const userDocs = await Promise.all(
      users.map(user => userCollection.save(user))
    );
    console.log(`Created ${userDocs.length} users`);

    // Create test items
    console.log('Creating test items...');
    const items = [
      {
        name: 'Laptop',
        description: 'High-performance laptop with 16GB RAM',
        sku: 'TECH-001',
        price: 1299.99,
        stock: 10,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Smartphone',
        description: 'Latest model with dual camera',
        sku: 'TECH-002',
        price: 899.99,
        stock: 15,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Headphones',
        description: 'Noise-cancelling wireless headphones',
        sku: 'TECH-003',
        price: 249.99,
        stock: 20,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Tablet',
        description: '10-inch tablet with retina display',
        sku: 'TECH-004',
        price: 499.99,
        stock: 8,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Smartwatch',
        description: 'Water-resistant smartwatch with health tracking',
        sku: 'TECH-005',
        price: 299.99,
        stock: 12,
        createdAt: now,
        updatedAt: now
      }
    ];

    const itemCollection = db.collection(COLLECTIONS.ITEMS);
    const itemDocs = await Promise.all(
      items.map(item => itemCollection.save(item))
    );
    console.log(`Created ${itemDocs.length} items`);

    // Create test orders using the OrderRepository
    console.log('Creating test orders...');
    const orderRepository = new OrderRepository();

    // Order 1: John buys a laptop and headphones
    await orderRepository.createOrderWithItems(
      userDocs[0]._key as string,
      {
        orderDate: now,
        status: 'delivered'
      },
      [
        { itemId: itemDocs[0]._key as string, amount: 1 }, // Laptop
        { itemId: itemDocs[2]._key as string, amount: 1 }  // Headphones
      ]
    );

    // Order 2: Jane buys a smartphone and a smartwatch
    await orderRepository.createOrderWithItems(
      userDocs[1]._key as string,
      {
        orderDate: now,
        status: 'shipped'
      },
      [
        { itemId: itemDocs[1]._key as string, amount: 1 }, // Smartphone
        { itemId: itemDocs[4]._key as string, amount: 1 }  // Smartwatch
      ]
    );

    // Order 3: Bob buys multiple items
    await orderRepository.createOrderWithItems(
      userDocs[2]._key as string,
      {
        orderDate: now,
        status: 'processing'
      },
      [
        { itemId: itemDocs[1]._key as string, amount: 1 }, // Smartphone
        { itemId: itemDocs[2]._key as string, amount: 2 }, // Headphones (2x)
        { itemId: itemDocs[3]._key as string, amount: 1 }  // Tablet
      ]
    );

    // Order 4: John has a pending order
    await orderRepository.createOrderWithItems(
      userDocs[0]._key as string,
      {
        orderDate: now,
        status: 'pending'
      },
      [
        { itemId: itemDocs[3]._key as string, amount: 1 }, // Tablet
        { itemId: itemDocs[4]._key as string, amount: 1 }  // Smartwatch
      ]
    );

    console.log('Created 4 orders with items');
    console.log('Test data seeding completed successfully');

  } catch (error) {
    console.error('Error seeding test data:', error);
    process.exit(1);
  }
}

// Execute seeding
seedTestData(); 