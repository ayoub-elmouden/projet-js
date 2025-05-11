import jwt from 'jsonwebtoken';
import { pool } from './db.js';

// Use environment variable or fallback to a default secret key
const JWT_SECRET = process.env.JWT_SECRET || '123456789abcdefg';

export async function verifyToken(token) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT token FROM revoked_tokens WHERE token = ?', [token]);
    if (rows.length > 0) {
      throw new Error('Token has been revoked');
    }
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  } finally {
    if (connection) connection.release();
  }
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function decodeToken(token) {
  return jwt.decode(token);
}