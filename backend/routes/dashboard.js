import express from 'express';
import DashboardController from '../controllers/dashboardController.js';
import { verifyToken } from '../config/jwt.js'; // For authentication

const router = express.Router();

// Middleware to verify JWT and restrict access to admins (e.g., professors)
const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const user = await verifyToken(token);
    if (user.role !== 'professor') { // Assuming professors are admins
      return res.status(403).json({ error: 'Access denied' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Get dashboard summary (protected route)
router.get('/summary', authenticateAdmin, DashboardController.getDashboardSummary);

export default router;