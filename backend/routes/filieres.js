// routes/filieres.js
import express from 'express';

const router = express.Router();

// Example GET route for fetching filieres
router.get('/', (req, res) => {
  const filieres = [
    { id: 1, name: '2IDL' },
    { id: 2, name: 'PC' },
    { id: 3, name: 'BCG' },
  ];
  res.json(filieres);
});

export default router;
