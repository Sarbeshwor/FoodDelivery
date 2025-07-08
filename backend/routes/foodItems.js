// routes/foodItems.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all food items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food_items');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
