const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/coupons - Get all coupons for a specific kitchen
router.get('/', async (req, res) => {
  const { kitchenId } = req.query;
  
  if (!kitchenId) {
    return res.status(400).json({ 
      success: false, 
      message: 'kitchenId is required' 
    });
  }

  try {
    const result = await pool.query(`
      SELECT * FROM kitchen_coupons 
      WHERE kitchen_id = $1 
      ORDER BY created_at DESC
    `, [kitchenId]);
    
    res.json({
      success: true,
      coupons: result.rows
    });
  } catch (err) {
    console.error('Error fetching coupons:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching coupons' 
    });
  }
});

// POST /api/coupons - Create a new coupon
router.post('/', async (req, res) => {
  const { 
    kitchen_id, 
    coupon_code, 
    discount_percent, 
    valid_from, 
    valid_until, 
    usage_limit 
  } = req.body;

  // Validation
  if (!kitchen_id || !coupon_code || !discount_percent || !valid_from || !valid_until) {
    return res.status(400).json({ 
      success: false, 
      message: 'All required fields must be provided' 
    });
  }

  if (discount_percent < 1 || discount_percent > 100) {
    return res.status(400).json({ 
      success: false, 
      message: 'Discount percent must be between 1 and 100' 
    });
  }

  if (new Date(valid_from) >= new Date(valid_until)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Valid from date must be before valid until date' 
    });
  }

  try {
    // Check if coupon code already exists for this kitchen
    const existingCoupon = await pool.query(
      'SELECT id FROM kitchen_coupons WHERE kitchen_id = $1 AND coupon_code = $2',
      [kitchen_id, coupon_code]
    );

    if (existingCoupon.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Coupon code already exists for this kitchen' 
      });
    }

    const result = await pool.query(`
      INSERT INTO kitchen_coupons 
      (kitchen_id, coupon_code, discount_percent, valid_from, valid_until, usage_limit, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `, [kitchen_id, coupon_code, discount_percent, valid_from, valid_until, usage_limit || null]);
    
    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating coupon:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating coupon' 
    });
  }
});

// PUT /api/coupons/:id - Update an existing coupon
router.put('/:id', async (req, res) => {
  const couponId = req.params.id;
  const { 
    coupon_code, 
    discount_percent, 
    valid_from, 
    valid_until, 
    usage_limit 
  } = req.body;

  // Validation
  if (!coupon_code || !discount_percent || !valid_from || !valid_until) {
    return res.status(400).json({ 
      success: false, 
      message: 'All required fields must be provided' 
    });
  }

  if (discount_percent < 1 || discount_percent > 100) {
    return res.status(400).json({ 
      success: false, 
      message: 'Discount percent must be between 1 and 100' 
    });
  }

  if (new Date(valid_from) >= new Date(valid_until)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Valid from date must be before valid until date' 
    });
  }

  try {
    const result = await pool.query(`
      UPDATE kitchen_coupons 
      SET coupon_code = $1, discount_percent = $2, valid_from = $3, valid_until = $4, usage_limit = $5
      WHERE id = $6
      RETURNING *
    `, [coupon_code, discount_percent, valid_from, valid_until, usage_limit || null, couponId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Coupon not found' 
      });
    }

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating coupon:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating coupon' 
    });
  }
});

// DELETE /api/coupons/:id - Delete a coupon
router.delete('/:id', async (req, res) => {
  const couponId = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM kitchen_coupons WHERE id = $1 RETURNING *',
      [couponId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Coupon not found' 
      });
    }

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting coupon:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting coupon' 
    });
  }
});

// GET /api/coupons/validate/:code - Validate a coupon code
router.get('/validate/:code', async (req, res) => {
  const { code } = req.params;
  const { kitchenId } = req.query;

  if (!kitchenId) {
    return res.status(400).json({ 
      success: false, 
      message: 'kitchenId is required' 
    });
  }

  try {
    const result = await pool.query(`
      SELECT * FROM kitchen_coupons 
      WHERE kitchen_id = $1 AND coupon_code = $2 
      AND valid_from <= NOW() AND valid_until >= NOW()
    `, [kitchenId, code]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid or expired coupon code' 
      });
    }

    res.json({
      success: true,
      coupon: result.rows[0]
    });
  } catch (err) {
    console.error('Error validating coupon:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while validating coupon' 
    });
  }
});

module.exports = router;
