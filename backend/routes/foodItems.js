// routes/foodItems.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const pool = require('../db');
const cloudinary = require('../uploads/cloudinary');

// Use multer for file uploads (temp storage)
const upload = multer({ dest: 'uploads/' });

/**
 * POST /api/food/add
 * Uploads image to Cloudinary, saves new food item to DB
 */
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    // 1️⃣ Upload image to Cloudinary
    const cloudResult = await cloudinary.uploader.upload(req.file.path);
    const imageUrl = cloudResult.secure_url;

    // 2️⃣ Get other form data including kitchenId
    const { name, description, price, category, kitchenId } = req.body;
    const kitchen_id = kitchenId;  // Use kitchenId sent from frontend

    if (!kitchen_id) {
      return res.status(400).json({ success: false, message: 'kitchenId is required' });
    }

    // 3️⃣ Insert into food_items table
    const insertQuery = `
      INSERT INTO food_items (name, image, price, description, category, kitchen_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [name, imageUrl, price, description, category, kitchen_id];
    const result = await pool.query(insertQuery, values);

    // 4️⃣ Remove local temp file
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


/**
 * GET /api/food/
 * Get all food items
 */
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


/**
 * DELETE /api/food/:id
 * Delete a food item by _id
 */
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
