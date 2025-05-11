import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/db.js';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import examRoutes from './routes/exams.js';
import questionRoutes from './routes/questions.js';
import userRoutes from './routes/users.js';
import dashboardRoutes from './routes/dashboard.js';
import filieresRoutes from './routes/filieres.js';

const app = express();

// CORS configuration
const allowedOrigins = ['http://127.0.0.1:5501', 'http://localhost:8000', 'http://localhost:5501', 'http://localhost:5500', 'http://localhost'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/filieres', filieresRoutes);

// Add a simple health check route for debugging
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy');
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
