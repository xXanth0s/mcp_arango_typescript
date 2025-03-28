import express from 'express';
import { ItemRepository } from '../repositories/ItemRepository.js';

const router: express.Router = express.Router();
const itemRepo = new ItemRepository();

// Get all items
router.get('/', async (req, res, next) => {
  try {
    const items = await itemRepo.findAll();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// Get an item by ID
router.get('/:id', async (req, res, next) => {
  try {
    const item = await itemRepo.findByKey(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// Search items by name
router.get('/search/name', async (req, res, next) => {
  try {
    const name = req.query.q as string;
    if (!name) {
      res.status(400).json({ message: 'Query parameter q is required' });
      return;
    }
    
    const items = await itemRepo.findByName(name);
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// Get items low in stock
router.get('/search/low-stock', async (req, res, next) => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 10;
    const items = await itemRepo.findLowStock(threshold);
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// Create a new item
router.post('/', async (req, res, next) => {
  try {
    const { name, description, sku, price, stock } = req.body;
    
    // Validate required fields
    if (!name || !sku || price === undefined || stock === undefined) {
      res.status(400).json({ 
        message: 'Name, SKU, price, and stock are required' 
      });
      return;
    }
    
    // Check if item with this SKU already exists
    const existingItem = await itemRepo.findBySku(sku);
    if (existingItem) {
      res.status(409).json({ message: 'Item with this SKU already exists' });
      return;
    }
    
    const now = new Date().toISOString();
    const item = await itemRepo.create({
      name,
      description: description || '',
      sku,
      price: Number(price),
      stock: Number(stock),
      createdAt: now,
      updatedAt: now
    });
    
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

// Update an item
router.put('/:id', async (req, res, next) => {
  try {
    const { name, description, price, stock } = req.body;
    
    // Validate if item exists
    const item = await itemRepo.findByKey(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    
    const updateData: Partial<typeof item> = {
      updatedAt: new Date().toISOString()
    };
    
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    
    const updatedItem = await itemRepo.update(req.params.id, updateData);
    res.json(updatedItem);
  } catch (error) {
    next(error);
  }
});

// Delete an item
router.delete('/:id', async (req, res, next) => {
  try {
    const item = await itemRepo.findByKey(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    
    await itemRepo.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router; 