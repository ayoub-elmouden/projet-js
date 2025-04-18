
import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/db.js';
import cors from 'cors';


import exams from './routes/exams.js';
import questions from './routes/questions.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/exams', exams);
app.use('/api/questions', questions);


connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));