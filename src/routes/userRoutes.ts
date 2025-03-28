import express from 'express';
import { UserRepository } from '../repositories/UserRepository.js';

const router = express.Router();
const userRepo = new UserRepository();

// Get all users
router.get('/', async (req, res, next) => {
  try {
    const users = await userRepo.findAll();
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    res.json(safeUsers);
  } catch (error) {
    next(error);
  }
});

// Get a user by ID
router.get('/:id', async (req, res, next) => {
  try {
    const user = await userRepo.findByKey(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    next(error);
  }
});

// Get a user with their orders
router.get('/:id/orders', async (req, res, next) => {
  try {
    const userWithOrders = await userRepo.getUserWithOrders(req.params.id);
    res.json(userWithOrders);
  } catch (error) {
    if ((error as Error).message.includes('not found')) {
      return res.status(404).json({ message: 'User not found' });
    }
    next(error);
  }
});

// Create a new user
router.post('/', async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    
    // Validate required fields
    if (!email || !name || !password) {
      return res.status(400).json({ message: 'Email, name, and password are required' });
    }
    
    // Check if user with this email already exists
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    const now = new Date().toISOString();
    const user = await userRepo.create({
      email,
      name,
      password, // In a real app, this should be hashed
      createdAt: now,
      updatedAt: now
    });
    
    const { password: _, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (error) {
    next(error);
  }
});

// Update a user
router.put('/:id', async (req, res, next) => {
  try {
    const { name, email } = req.body;
    
    // Validate if user exists
    const user = await userRepo.findByKey(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If email is changed, check if it's already in use
    if (email && email !== user.email) {
      const existingUser = await userRepo.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email is already in use' });
      }
    }
    
    const updateData: Partial<typeof user> = {
      updatedAt: new Date().toISOString()
    };
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    const updatedUser = await userRepo.update(req.params.id, updateData);
    const { password, ...safeUser } = updatedUser;
    
    res.json(safeUser);
  } catch (error) {
    next(error);
  }
});

// Delete a user
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await userRepo.findByKey(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await userRepo.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router; 