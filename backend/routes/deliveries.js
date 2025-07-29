// routes/deliveries.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/deliveries/revenue?delivery_user_id=...&filter=...
router.get('/revenue', async (req, res) => {
  const { delivery_user_id, filter } = req.query;

  if (!delivery_user_id) {
    return res.status(400).json({
      success: false,
      message: 'delivery_user_id is required'
    });
  }

  try {
    let dateFilter = '';
    const params = [delivery_user_id];

    if (filter && filter !== 'all') {
      switch (filter) {
        case 'past24hrs':
          dateFilter = "AND da.assigned_at >= NOW() - INTERVAL '24 hours'";
          break;
        case 'thisWeek':
          dateFilter = "AND da.assigned_at >= DATE_TRUNC('week', NOW())";
          break;
        case 'thisMonth':
          dateFilter = "AND da.assigned_at >= DATE_TRUNC('month', NOW())";
          break;
        case 'pastMonth':
          dateFilter = `AND da.assigned_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' 
                        AND da.assigned_at < DATE_TRUNC('month', NOW())`;
          break;
        default:
          dateFilter = '';
      }
    }

    const query = `
      SELECT 
        da.id,
        da.order_item_id,
        da.delivery_user_id,
        da.assigned_at,
        da.deliveryprice,
        oi.status,
        oi.quantity,
        fi.name AS item_name,
        dl.first_name || ' ' || dl.last_name AS customer_name
      FROM delivery_assignments da
      JOIN order_items oi ON da.order_item_id = oi.order_item_id
      LEFT JOIN food_items fi ON oi.food_item_id = fi._id
      LEFT JOIN delivery_locations dl ON oi.user_id = dl.userid
      WHERE da.delivery_user_id = $1
      ${dateFilter}
      ORDER BY da.assigned_at DESC
    `;

    console.log('Executing query:', query);
    console.log('With params:', params);

    const result = await pool.query(query, params);
    console.log("Result rows:", result.rows);

    // Calculate total revenue only for delivered orders
    const totalRevenue = result.rows
      .filter(delivery => delivery.status === 'delivered')
      .reduce((sum, delivery) => {
        return sum + (parseInt(delivery.deliveryprice) || 0);
      }, 0);

    res.json({
      success: true,
      deliveries: result.rows,
      totalRevenue
    });

  } catch (err) {
    console.error('Error fetching delivery revenue data:', err);
    res.status(500).json({ success: false, message: 'Server error fetching delivery revenue data' });
  }
});

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
        dl.first_name,
        dl.last_name,
        dl.city,
        dl.street
      FROM delivery_assignments da
      JOIN order_items oi ON da.order_item_id = oi.order_item_id
      JOIN food_items fi ON oi.food_item_id = fi._id
      JOIN delivery_locations dl ON oi.user_id = dl.userid
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
