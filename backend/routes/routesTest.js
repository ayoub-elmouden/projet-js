// routes/routesTest.js
import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

router.get('/test-db', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [dbResults] = await connection.query('SELECT DATABASE() AS db');
    const dbName = dbResults[0].db;
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Test-db route accessed:', { database: dbName, tables }); // Debug log
    res.json({ message: 'Database connected', database: dbName, tables });
  } catch (err) {
    console.error('Test-db route error:', err); // Debug log
    res.status(500).json({ error: 'Database query failed', details: err.message });
  } finally {
    if (connection) connection.release();
  }
});

export default router;