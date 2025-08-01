const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const pool = require('../db');
const cloudinary = require('../uploads/cloudinary');

const upload = multer({ dest: 'uploads/' });

// POST /api/food/add
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const cloudResult = await cloudinary.uploader.upload(req.file.path);
    const imageUrl = cloudResult.secure_url;

    const { name, description, price, category, kitchenId } = req.body;
    const kitchen_id = kitchenId;

    if (!kitchen_id) {
      return res.status(400).json({ success: false, message: 'kitchenId is required' });
    }

    const insertQuery = `
      INSERT INTO food_items (name, image, price, description, category, kitchen_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [name, imageUrl, price, description, category, kitchen_id];
    const result = await pool.query(insertQuery, values);

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: 'Food item added successfully',
      foodItem: result.rows[0],
    });

  } catch (error) {
    console.error('Error adding food item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding food item',
    });
  }
});

// GET /api/food/
router.get('/', async (req, res) => {
  const kitchenId = req.query.kitchenId;

  try {
    let query = 'SELECT * FROM food_items';
    let params = [];

    if (kitchenId) {
      query += ' WHERE kitchen_id = $1';
      params.push(kitchenId);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching food items:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/food/:id
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

// PUT /api/food/:id
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { name, description, price, category } = req.body;

  try {
    const updateQuery = `
      UPDATE food_items 
      SET name = $1, description = $2, price = $3, category = $4, updated_at = CURRENT_TIMESTAMP
      WHERE _id = $5 
      RETURNING *
    `;
    const values = [name, description, price, category, id];
    const result = await pool.query(updateQuery, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({
      success: true,
      message: 'Food item updated successfully',
      foodItem: result.rows[0],
    });

  } catch (error) {
    console.error('Error updating food item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
