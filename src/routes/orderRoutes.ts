import express from 'express';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { QueryRepository } from '../repositories/QueryRepository.js';

const router = express.Router();
const orderRepo = new OrderRepository();
const queryRepo = new QueryRepository();

// Get all orders
router.get('/', async (req, res, next) => {
  try {
    const orders = await orderRepo.findAll();
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Get an order by ID
router.get('/:id', async (req, res, next) => {
  try {
    const order = await orderRepo.findByKey(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
});

// Get an order with its items
router.get('/:id/items', async (req, res, next) => {
  try {
    const orderWithItems = await orderRepo.getOrderWithItems(req.params.id);
    res.json(orderWithItems);
  } catch (error) {
    if ((error as Error).message.includes('not found')) {
      return res.status(404).json({ message: 'Order not found' });
    }
    next(error);
  }
});

// Get orders by status
router.get('/status/:status', async (req, res, next) => {
  try {
    const status = req.params.status as any;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Status must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    const orders = await orderRepo.findByStatus(status);
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Get recent orders with items and user info
router.get('/reports/recent', async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const recentOrders = await queryRepo.getRecentOrdersWithItems(limit);
    res.json(recentOrders);
  } catch (error) {
    next(error);
  }
});

// Create a new order
router.post('/', async (req, res, next) => {
  try {
    const { userId, items, orderDate, status } = req.body;
    
    // Validate required fields
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: 'User ID and at least one item are required' 
      });
    }
    
    // Validate items format
    for (const item of items) {
      if (!item.itemId || !item.amount || item.amount <= 0) {
        return res.status(400).json({ 
          message: 'Each item must have an itemId and a positive amount' 
        });
      }
    }
    
    const order = await orderRepo.createOrderWithItems(
      userId,
      { orderDate, status },
      items
    );
    
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

// Update order status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Status must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    try {
      const updatedOrder = await orderRepo.updateStatus(req.params.id, status);
      res.json(updatedOrder);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return res.status(404).json({ message: 'Order not found' });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

export default router; 