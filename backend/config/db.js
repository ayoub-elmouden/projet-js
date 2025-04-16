
import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',

  database: process.env.DB_NAME || 'projet_db',
  port: process.env.DB_PORT || 3306,

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

    }
  } finally {
    if (connection) connection.release();
  }
};

export { pool, connectDB };

