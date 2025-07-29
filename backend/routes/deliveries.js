// routes/deliveries.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/deliveries/:deliveryUserId
router.get('/:deliveryUserId', async (req, res) => {
  const { deliveryUserId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        da.id AS assignment_id,
        da.assigned_at,
        oi.order_item_id,
        oi.status,
        oi.quantity,
        fi.name AS food_name,
        fi.image AS food_image,
        fi.price,
        l.first_name,
        l.last_name,
        l.city,
        l.street
      FROM delivery_assignment da
      JOIN order_items oi ON da.order_item_id = oi.order_item_id
      JOIN food_items fi ON oi.food_item_id = fi._id
      JOIN location l ON oi.user_id = l.userid
      WHERE da.delivery_user_id = $1
      ORDER BY da.assigned_at DESC;
      `,
      [deliveryUserId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
});

module.exports = router;
