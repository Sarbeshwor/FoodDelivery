const express = require('express');
const router = express.Router();
const pool = require('../db');

// -----------------------------
// POST /api/order/place
// -----------------------------
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
        `INSERT INTO order_items (user_id, food_item_id, kitchen_id, quantity, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [user_id, food_item_id, kitchen_id, quantity, 'pending']
      );
    }

    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [user_id]);

    res.json({ success: true, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -----------------------------
// GET /api/order/accepted
// -----------------------------
router.get('/accepted', async (req, res) => {
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
      WHERE o.status = 'accepted'
      ORDER BY o.ordered_at DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error('Error fetching accepted orders:', err);
    res.status(500).json({ success: false, message: 'Server error fetching accepted orders' });
  }
});

// -----------------------------
// GET /api/order/ready_for_pickup
// -----------------------------
router.get('/ready_for_pickup', async (req, res) => {
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
      WHERE o.status = 'ready_for_pickup'
      ORDER BY o.ordered_at DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error('Error fetching ready for pickup orders:', err);
    res.status(500).json({ success: false, message: 'Server error fetching ready for pickup orders' });
  }
});

router.put('/onitsway/:id', async (req, res) => {
  const { id } = req.params;
  const { delivery_user_id } = req.body;

  if (!delivery_user_id) {
    return res.status(400).json({ success: false, message: "Missing delivery_user_id" });
  }

  try {
    const client = await pool.connect();

    // Step 1: Update order status
    const result = await client.query(
      `UPDATE order_items 
       SET status = 'onitsway', ordered_at = NOW()
       WHERE order_item_id = $1
       RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      client.release();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Step 2: Track assignment in delivery_assignments table
    await client.query(
      `INSERT INTO delivery_assignments (order_item_id, delivery_user_id)
       VALUES ($1, $2)
       ON CONFLICT (order_item_id) DO UPDATE SET delivery_user_id = $2`,
      [id, delivery_user_id]
    );

    client.release();

    res.json({
      success: true,
      message: 'Order marked on its way and delivery person assigned',
      order: result.rows[0],
    });
  } catch (err) {
    console.error('Error marking order onitsway:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -----------------------------
// GET /api/order?kitchenId=...
// -----------------------------
router.get('/', async (req, res) => {
  const { kitchenId } = req.query;

  if (!kitchenId) {
    return res.status(400).json({ success: false, message: 'kitchenId is required' });
  }

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

// -----------------------------
// PUT /api/order/:id/status
// -----------------------------
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    'pending',
    'accepted',
    'ready_for_pickup',
    'onitsway',
    'delivered',
    'cancelled'
  ];

  const allowedTransitions = {
    pending: ['accepted', 'cancelled'],
    accepted: ['ready_for_pickup', 'cancelled'],
    ready_for_pickup: ['onitsway'],
    onitsway: ['delivered']
  };

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const existingOrder = await pool.query(
      'SELECT status FROM order_items WHERE order_item_id = $1',
      [id]
    );

    if (existingOrder.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const currentStatus = existingOrder.rows[0].status;

    if (
      currentStatus !== status &&
      allowedTransitions[currentStatus] &&
      !allowedTransitions[currentStatus].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${status}`
      });
    }

    const result = await pool.query(
      `UPDATE order_items SET status = $1, ordered_at = NOW() WHERE order_item_id = $2 RETURNING *`,
      [status, id]
    );

    res.json({ success: true, message: 'Order status updated', order: result.rows[0] });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ success: false, message: 'Server error updating order status' });
  }
});

// -----------------------------
// GET /api/order/delivery
// -----------------------------
router.get('/delivery', async (req, res) => {
  try {
    const query = `
      SELECT 
        oi.order_item_id,
        fi.name AS order_name,
        fi.price * oi.quantity AS total_price,
        dl.street AS place_name,
        CONCAT(dl.first_name, ' ', dl.last_name) AS person_name,
        oi.status
      FROM order_items oi
      JOIN food_items fi ON oi.food_item_id = fi._id
      JOIN delivery_locations dl ON oi.user_id = dl.userid
      WHERE oi.status = 'ready_for_pickup'
    `;

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching delivery orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// POST /api/order/accept/:id
// -----------------------------
router.post('/accept/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updateQuery = `
      UPDATE order_items 
      SET status = 'accepted' 
      WHERE order_item_id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(updateQuery, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order accepted", order: rows[0] });
  } catch (err) {
    console.error("Error accepting order:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
