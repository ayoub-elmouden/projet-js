// app.js
import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/db.js';
import testRoutes from './routes/routesTest.js';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', testRoutes);

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));