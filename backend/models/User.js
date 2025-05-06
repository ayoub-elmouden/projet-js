import { pool } from '../config/db.js';

/**
 * User model functions to interact with the users table in the database.
 */

export const getAllUsers = async () => {
  const [rows] = await pool.query('SELECT * FROM users');
  return rows;
};

export const getUserById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

export const createUser = async (userData) => {
  const { username, email, password } = userData;
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, password]
  );
  return result.insertId;
};

export const updateUser = async (id, userData) => {
  const { username, email, password } = userData;
  const [result] = await pool.query(
    'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
    [username, email, password, id]
  );
  return result.affectedRows;
};

export const deleteUser = async (id) => {
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows;}
