import express from 'express';
import { pool } from '../config/db.js';
import { verifyToken } from '../config/jwt.js';

const router = express.Router();

// Middleware to verify JWT
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = await verifyToken(token);
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Get user details (same as /profile, but under /users for consistency)
router.get('/me', authenticate, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    let user, role = req.user.role;

    if (role === 'professor') {
      const [users] = await connection.query('SELECT Id_Prof AS id, email, nom, prenom FROM inf_enseignants WHERE Id_Prof = ?', [req.user.id]);
      user = users[0];
    } else {
      const [users] = await connection.query(
        'SELECT Id_etu AS id, email, nom, prenom, date_naiss, sexe, etablissement, id_fil FROM inf_etu WHERE Id_etu = ?', [req.user.id]
      );
      user = users[0];
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ id: user.id, email: user.email, role, nom: user.nom, prenom: user.prenom });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Update user profile
router.put('/me', authenticate, async (req, res) => {
  const { nom, prenom, date_naiss, sexe, etablissement } = req.body;
  if (!nom || !prenom) {
    return res.status(400).json({ error: 'Nom and prenom are required' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    if (req.user.role === 'professor') {
      await connection.query(
        'UPDATE inf_enseignants SET nom = ?, prenom = ? WHERE Id_Prof = ?',
        [nom, prenom, req.user.id]
      );
    } else {
      await connection.query(
        'UPDATE inf_etu SET nom = ?, prenom = ?, date_naiss = ?, sexe = ?, etablissement = ? WHERE Id_etu = ?',
        [nom, prenom, date_naiss || null, sexe || null, etablissement || null, req.user.id]
      );
    }

    await connection.commit();
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

export default router;