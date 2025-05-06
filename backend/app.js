
import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/db.js';
import cors from 'cors';


import exams from './routes/exams.js';
import questions from './routes/questions.js';
import { UserController } from './controllers/userController.js';
import { authController } from './controllers/authController.js';
import auth from './routes/auth.js';
import user from './routes/users.js';


const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/exams', exams);
app.use('/api/questions', questions);
app.use('/api/auth', auth); 
app.use('/api/users', user);


connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// Routes
app.post('/register', async (req, res) => {
  try {
    const result = await UserController.register(req);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const result = await UserController.login(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.get('/profile', (req, res) => {
  try {
    const user = UserController.getProfile(req);
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




// Routes
app.post('/register', async (req, res) => {
  try {
    const result = await authController.register(req);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const result = await authController.login(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.get('/profile', async (req, res) => {
  try {
    const user = await authController.getProfile(req);
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/logout', async (req, res) => {
  try {
    const result = await authController.logout(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});


const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}; 




startServer();