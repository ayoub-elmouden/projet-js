import bcryptjs from 'bcryptjs';
import { generateToken, verifyToken } from '../config/jwt.js';
import { pool } from '../config/db.js';

export const UserController = {
  async register(req) {
    const { email, password, role, nom, prenom, date_naiss, sexe, etablissement, id_fil } = req.body;
    if (!email || !password || !role || !nom || !prenom) {
      throw new Error('Email, password, role, nom, and prenom are required');
    }
    if (!['student', 'professor'].includes(role)) {
      throw new Error('Invalid role');
    }

    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      let userId;
      if (role === 'professor') {
        // Check if email exists in inf_enseignants
        const [existing] = await connection.query('SELECT Id_Prof FROM inf_enseignants WHERE email = ?', [email]);
        if (existing.length > 0) {
          throw new Error('Email already exists');
        }
        const [result] = await connection.query(
          'INSERT INTO inf_enseignants (nom, prenom, email, password) VALUES (?, ?, ?, ?)',
          [nom, prenom, email, hashedPassword]
        );
        userId = result.insertId;
      } else {
        if (!id_fil) {
          throw new Error('id_fil is required for students');
        }
        // Check if email exists in inf_etu
        const [existing] = await connection.query('SELECT Id_etu FROM inf_etu WHERE email = ?', [email]);
        if (existing.length > 0) {
          throw new Error('Email already exists');
        }
        const [result] = await connection.query(
          'INSERT INTO inf_etu (email, nom, prenom, date_naiss, sexe, etablissement, id_fil, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [email, nom, prenom, date_naiss || null, sexe || null, etablissement || null, id_fil, hashedPassword]
        );
        userId = result.insertId;
      }

      await connection.commit();

      const token = generateToken({ id: userId, email, role });
      return { token, user: { id: userId, email, role, nom, prenom } };
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) connection.release();
    }
  },

  async login(req) {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    let connection;
    try {
      connection = await pool.getConnection();
      let user, role;

      // Check inf_enseignants
      let [users] = await connection.query('SELECT Id_Prof AS id, email, password, nom, prenom FROM inf_enseignants WHERE email = ?', [email]);
      if (users.length > 0) {
        user = users[0];
        role = 'professor';
      } else {
        // Check inf_etu
        [users] = await connection.query(
          'SELECT Id_etu AS id, email, password, nom, prenom, date_naiss, sexe, etablissement, id_fil FROM inf_etu WHERE email = ?', [email]
        );
        if (users.length > 0) {
          user = users[0];
          role = 'student';
        } else {
          throw new Error('Invalid email or password');
        }
      }

      const isValid = await bcryptjs.compare(password, user.password);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      const token = generateToken({ id: user.id, email, role });
      return { token, user: { id: user.id, email, role, nom: user.nom, prenom: user.prenom } };
    } catch (err) {
      throw err;
    } finally {
      if (connection) connection.release();
    }
  },

  async getProfile(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    let connection;
    try {
      connection = await pool.getConnection();
      let user, role;

      if (decoded.role === 'professor') {
        const [users] = await connection.query('SELECT Id_Prof AS id, email, nom, prenom FROM inf_enseignants WHERE Id_Prof = ?', [decoded.id]);
        user = users[0];
        role = 'professor';
      } else {
        const [users] = await connection.query(
          'SELECT Id_etu AS id, email, nom, prenom, date_naiss, sexe, etablissement, id_fil FROM inf_etu WHERE Id_etu = ?', [decoded.id]
        );
        user = users[0];
        role = 'student';
      }

      if (!user) {
        throw new Error('User not found');
      }

      return { id: user.id, email: user.email, role, nom: user.nom, prenom: user.prenom };
    } catch (err) {
      throw err;
    } finally {
      if (connection) connection.release();
    }
  },

  async logout(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header missing or invalid');
    }
    const token = authHeader.split(' ')[1];
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.query('INSERT INTO revoked_tokens (token) VALUES (?)', [token]);
      return { message: 'Logged out successfully' };
    } catch (err) {
      throw err;
    } finally {
      if (connection) connection.release();
    }
  },
};