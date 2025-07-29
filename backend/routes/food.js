const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/food — fetch all food items with optional kitchen filtering
router.get('/', async (req, res) => {
  try {
    const { kitchen_id } = req.query;
    
    let query = 'SELECT * FROM food_items';
    let params = [];
    
    if (kitchen_id) {
      query += ' WHERE kitchen_id = $1';
      params.push(kitchen_id);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch food list:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
