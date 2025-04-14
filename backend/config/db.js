// config/db.js
import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'projet_db',
  port: process.env.DB_PORT || 3306,
  socketPath: process.env.DB_SOCKET || '/tmp/mysql.sock',
});

const connectDB = async () => {
  let connection;
  try {
    console.log('Connecting to database:', process.env.DB_NAME || 'projet_db');
    connection = await pool.getConnection();
    console.log('MySQL connected...');
    const [dbResults] = await connection.query('SELECT DATABASE() AS db');
    console.log('Connected to database:', dbResults[0].db);
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:', tables);
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    if (err.code === 'ER_BAD_DB_ERROR') {
      try {
        // Connect without database to create one
        const tempPool = createPool({
          host: process.env.DB_HOST || '127.0.0.1',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASS || '',
          port: process.env.DB_PORT || 3306,
          socketPath: process.env.DB_SOCKET || '/tmp/mysql.sock',
        });
        const tempConnection = await tempPool.getConnection();
        const dbName = process.env.DB_NAME || 'projet_db';
        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`Database ${dbName} created or already exists`);
        const [databases] = await tempConnection.query('SHOW DATABASES');
        console.log('Available databases:', databases);
        tempConnection.release();
        await tempPool.end();
        // Retry connection with pool
        connection = await pool.getConnection();
        console.log('MySQL connected after database creation...');
        const [dbResults] = await connection.query('SELECT DATABASE() AS db');
        console.log('Connected to database:', dbResults[0].db);
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables in database:', tables);
      } catch (innerErr) {
        console.error('Error creating database:', innerErr);
      }
    }
  } finally {
    if (connection) connection.release();
  }
};

export { pool, connectDB };