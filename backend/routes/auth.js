import express from 'express';
import { authController } from '../controllers/authController.js';

const router = express.Router();

// Register a new user (student or professor)
router.post('/register', async (req, res) => {
  try {
    const result = await authController.register(req);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  try {
    const result = await authController.login(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Get user profile (protected)
router.get('/profile', async (req, res) => {
  try {
    const user = await authController.getProfile(req);
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Logout (requires revoked_tokens table)
router.post('/logout', async (req, res) => {
  try {
    const result = await authController.logout(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

export default router;