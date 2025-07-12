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

router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query('DELETE FROM food_items WHERE _id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting food item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
