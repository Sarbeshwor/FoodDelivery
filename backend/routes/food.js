const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/food — fetch all food items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food_items');
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch food list:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
