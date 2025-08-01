const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/kitchens - Get all kitchens with owner information
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        k._id as kitchen_id,
        k.name as kitchen_name,
        k.description,
        k.address,
        k.phone,
        k.email,
        k.owner_id,
        u.name as owner_name,
        u.email as owner_email
      FROM kitchens k 
      LEFT JOIN users u ON k.owner_id = u._id
      ORDER BY k.created_at DESC
    `);
    
    res.json({
      success: true,
      kitchens: result.rows
    });
  } catch (err) {
    console.error('Error fetching kitchens:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching kitchens' 
    });
  }
});

module.exports = router;
