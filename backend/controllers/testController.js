import { pool } from '../config/db.js';

export const getTest = async (req, res) => {
  try {
    const [result] = await pool.execute('SELECT * FROM inf_fil');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};