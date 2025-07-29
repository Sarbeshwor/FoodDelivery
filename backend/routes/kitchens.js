const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/kitchens - Get all kitchens with owner information
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        k.id as kitchen_id,
        k.name as kitchen_name,
        k.owner_id,
        u.username,
        u.image_url
      FROM kitchens k 
      JOIN users u ON k.owner_id = u.userid
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
