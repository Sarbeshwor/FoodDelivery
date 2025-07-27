const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/orders/place
router.post('/place', async (req, res) => {
  const { user_id, items } = req.body;

  if (!user_id || !Array.isArray(items)) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  try {
    for (const item of items) {
      const { food_item_id, quantity } = item;

      if (quantity <= 0) continue;

      const kitchenRes = await pool.query(
        'SELECT kitchen_id FROM food_items WHERE _id = $1',
        [food_item_id]
      );

      const kitchen_id = kitchenRes.rows[0]?.kitchen_id;

      await pool.query(
        `INSERT INTO order_items (user_id, food_item_id, kitchen_id, quantity)
         VALUES ($1, $2, $3, $4)`,
        [user_id, food_item_id, kitchen_id, quantity]
      );
    }

    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [user_id]);

    res.json({ success: true, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/orders?kitchenId=...
router.get('/', async (req, res) => {
  const { kitchenId } = req.query;

  try {
    const query = `
      SELECT 
        o.order_item_id,
        o.quantity,
        o.status,
        o.ordered_at,
        u.username AS customer_name,
        f.name AS item_name,
        f.image
      FROM order_items o
      JOIN users u ON o.user_id = u.userid
      JOIN food_items f ON o.food_item_id = f._id
      WHERE o.kitchen_id = $1
      ORDER BY o.ordered_at DESC
    `;
    const result = await pool.query(query, [kitchenId]);
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE order_items SET status = $1 WHERE order_item_id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order status updated', order: result.rows[0] });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ success: false, message: 'Server error updating order status' });
  }
});

module.exports = router;
