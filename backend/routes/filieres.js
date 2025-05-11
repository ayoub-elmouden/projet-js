// routes/filieres.js
import express from 'express';

const router = express.Router();

// Example GET route for fetching filieres
router.get('/', (req, res) => {
  const filieres = [
    { id: 1, name: 'Informatique' },
    { id: 2, name: 'Mathématiques' },
    { id: 3, name: 'Physique' },
  ];
  res.json(filieres);
});

export default router;
