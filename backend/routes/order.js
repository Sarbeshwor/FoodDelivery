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
  `INSERT INTO delivery_assignments (order_item_id, delivery_user_id, assigned_at)
   VALUES ($1, $2, NOW())
   ON CONFLICT (order_item_id) DO UPDATE 
   SET delivery_user_id = EXCLUDED.delivery_user_id,
       assigned_at = NOW()`,
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

// -----------------------------
// GET /api/order/my-deliveries/:delivery_user_id
// -----------------------------
router.get('/my-deliveries/:delivery_user_id', async (req, res) => {
  const { delivery_user_id } = req.params;

  if (!delivery_user_id) {
    return res.status(400).json({ success: false, message: 'delivery_user_id is required' });
  }

  try {
    const query = `
      SELECT 
        da.id,
        da.order_item_id,
        da.delivery_user_id,
        da.assigned_at,
        oi.quantity,
        oi.status,
        oi.ordered_at,
        u.username AS customer_name,
        fi.name AS item_name,
        fi.image,
        fi.price,
        dl.street,
        dl.city,
        dl.postal_code AS zipcode,
        dl.country,
        CONCAT(dl.first_name, ' ', dl.last_name) AS customer_full_name,
        dl.phone
      FROM delivery_assignments da
      JOIN order_items oi ON da.order_item_id = oi.order_item_id
      JOIN users u ON oi.user_id = u.userid
      JOIN food_items fi ON oi.food_item_id = fi._id
      LEFT JOIN delivery_locations dl ON oi.user_id = dl.userid
      WHERE da.delivery_user_id = $1
      ORDER BY da.assigned_at DESC
    `;
    
    const result = await pool.query(query, [delivery_user_id]);
    console.log(`Found ${result.rows.length} deliveries for user ${delivery_user_id}`); // Debug log
    res.json({ success: true, deliveries: result.rows });
  } catch (err) {
    console.error('Error fetching delivery assignments:', err);
    res.status(500).json({ success: false, message: 'Server error fetching deliveries' });
  }
});

// -----------------------------
// GET /api/order/delivery-details/:order_item_id
// -----------------------------
router.get('/delivery-details/:order_item_id', async (req, res) => {
  const { order_item_id } = req.params;

  try {
    const query = `
      SELECT 
        oi.order_item_id,
        oi.quantity,
        oi.status,
        oi.ordered_at,
        u.username AS customer_name,
        fi.name AS item_name,
        fi.image,
        fi.price,
        dl.street,
        dl.city,
        dl.landmark,
        dl.postal_code,
        dl.country,
        dl.first_name,
        dl.last_name,
        dl.phone,
        dl.email
      FROM order_items oi
      JOIN users u ON oi.user_id = u.userid
      JOIN food_items fi ON oi.food_item_id = fi._id
      LEFT JOIN delivery_locations dl ON oi.user_id = dl.userid
      WHERE oi.order_item_id = $1
    `;
    
    const result = await pool.query(query, [order_item_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching delivery details:', err);
    res.status(500).json({ success: false, message: 'Server error fetching delivery details' });
  }
});

// -----------------------------
// GET /api/order/user-orders/:user_id
// -----------------------------
router.get('/user-orders/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
      SELECT 
        oi.order_item_id,
        oi.quantity,
        oi.status,
        oi.ordered_at,
        fi.name AS item_name,
        fi.image,
        fi.price,
        (fi.price * oi.quantity) AS total_amount
      FROM order_items oi
      JOIN food_items fi ON oi.food_item_id = fi._id
      WHERE oi.user_id = $1
      ORDER BY oi.ordered_at DESC
    `;
    
    const result = await pool.query(query, [user_id]);
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ success: false, message: 'Server error fetching user orders' });
  }
});

// -----------------------------
// POST /api/order/cancel/:order_item_id
// -----------------------------
router.post('/cancel/:order_item_id', async (req, res) => {
  const { order_item_id } = req.params;
  const { user_id, reason } = req.body;

  try {
    const client = await pool.connect();
    
    // Get current order status
    const orderResult = await client.query(
      'SELECT status, user_id FROM order_items WHERE order_item_id = $1',
      [order_item_id]
    );

    if (orderResult.rowCount === 0) {
      client.release();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const { status, user_id: order_user_id } = orderResult.rows[0];

    // Verify user owns this order
    if (parseInt(order_user_id) !== parseInt(user_id)) {
      client.release();
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this order' });
    }

    // Check if order can be cancelled - users can cancel at any time except already cancelled
    const cancellableStatuses = ['pending', 'accepted', 'ready_for_pickup', 'onitsway', 'delivered'];
    if (!cancellableStatuses.includes(status)) {
      client.release();
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel order with status: ${status}. Order is already cancelled.` 
      });
    }

    // For all statuses including "onitsway", cancel completely when user cancels
    if (status === 'onitsway') {
      // Remove from delivery assignments since delivery is cancelled
      await client.query(
        'DELETE FROM delivery_assignments WHERE order_item_id = $1',
        [order_item_id]
      );
    }
    
    // Cancel the order completely for all statuses
    await client.query(
      `UPDATE order_items 
       SET status = 'cancelled', ordered_at = NOW() 
       WHERE order_item_id = $1`,
      [order_item_id]
    );

    client.release();
    res.json({ 
      success: true, 
      message: 'Order cancelled successfully', 
      action: 'cancelled' 
    });

  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ success: false, message: 'Server error cancelling order' });
  }
});

// -----------------------------
// POST /api/order/delivery-cancel/:order_item_id
// -----------------------------
router.post('/delivery-cancel/:order_item_id', async (req, res) => {
  const { order_item_id } = req.params;
  const { delivery_user_id, reason } = req.body;

  try {
    const client = await pool.connect();
    
    // Verify this delivery person is assigned to this order
    const deliveryResult = await client.query(
      'SELECT id FROM delivery_assignments WHERE order_item_id = $1 AND delivery_user_id = $2',
      [order_item_id, delivery_user_id]
    );

    if (deliveryResult.rowCount === 0) {
      client.release();
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized: You are not assigned to this delivery' 
      });
    }

    // Get current order status
    const orderResult = await client.query(
      'SELECT status FROM order_items WHERE order_item_id = $1',
      [order_item_id]
    );

    if (orderResult.rowCount === 0) {
      client.release();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const { status } = orderResult.rows[0];

    if (status !== 'onitsway') {
      client.release();
      return res.status(400).json({ 
        success: false, 
        message: 'Can only cancel delivery for orders that are on their way' 
      });
    }

    // Remove from delivery assignments and return to kitchen
    await client.query(
      'DELETE FROM delivery_assignments WHERE order_item_id = $1',
      [order_item_id]
    );
    
    // Update order status back to ready_for_pickup
    await client.query(
      `UPDATE order_items 
       SET status = 'ready_for_pickup', ordered_at = NOW() 
       WHERE order_item_id = $1`,
      [order_item_id]
    );

    client.release();
    res.json({ 
      success: true, 
      message: 'Delivery cancelled and order returned to kitchen', 
      action: 'returned_to_kitchen' 
    });

  } catch (err) {
    console.error('Error cancelling delivery:', err);
    res.status(500).json({ success: false, message: 'Server error cancelling delivery' });
  }
});

module.exports = router;
