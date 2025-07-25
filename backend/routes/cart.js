const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const cartItems = await pool.query(
  `SELECT ci.cart_item_id, ci.food_item_id, ci.quantity,
          fi.name, fi.price, fi.image, fi.description
   FROM cart_items ci
   JOIN food_items fi ON ci.food_item_id = fi._id
   WHERE ci.user_id = $1`,
  [userId]
);


    res.json(cartItems.rows);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// ✅ POST: add or update a cart item
router.post('/add', async (req, res) => {
  const { user_id, food_item_id, quantity } = req.body;

  if (!user_id || !food_item_id || quantity == null) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const existing = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND food_item_id = $2',
      [user_id, food_item_id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND food_item_id = $3',
        [quantity, user_id, food_item_id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart_items (user_id, food_item_id, quantity, added_at) VALUES ($1, $2, $3, NOW())',
        [user_id, food_item_id, quantity]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error adding/updating cart item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ DELETE: remove item from cart
// backend/routes/cart.js
router.delete('/delete/:cart_item_id', async (req, res) => {
  const { cart_item_id } = req.params;
  try {
    await pool.query('DELETE FROM cart WHERE cart_item_id = $1', [cart_item_id]);
    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});


module.exports = router;
