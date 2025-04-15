import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Database connection pool
const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'projet_js',
});

// Function to test the database connection
const connectDB = async () => {
  try {
    await pool.getConnection();
    console.log('MySQL connected...');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
};

export { pool, connectDB };
