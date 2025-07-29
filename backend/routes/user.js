const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('../uploads/cloudinary');

// Use multer for file uploads (temp storage)
const upload = multer({ dest: 'uploads/' });

// ---------------------------
// GET /:id
// ---------------------------
// Get basic user info by user ID
// Example: Express route
router.get('/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query('SELECT image_url FROM users WHERE userid = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });

    res.json(result.rows[0]); // returns { image_url: "..." }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});



// ---------------------------
// POST /api/user/register
// ---------------------------
// Register a new user (with default image if not provided)
router.post('/register', async (req, res) => {
  const { username, email, phone, password, image_url } = req.body;

  const defaultImage = 'https://cdn-icons-png.flaticon.com/512/219/219988.png';
  const finalImage = image_url || defaultImage;

  try {
    const result = await pool.query(
      `INSERT INTO users (username, email, phone, password, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING userid, username, email, phone, image_url`,
      [username, email, phone, password, finalImage]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ---------------------------
// PUT /api/user/:id/image
// ---------------------------
// Update user profile image
router.put('/:id/image', async (req, res) => {
  const userId = req.params.id;
  const { image_url } = req.body;

  if (!image_url) {
    return res.status(400).json({ message: 'Image URL required' });
  }

  try {
    await pool.query(
      'UPDATE users SET image_url = $1 WHERE userid = $2',
      [image_url, userId]
    );

    res.status(200).json({ message: 'Profile image updated successfully' });
  } catch (err) {
    console.error('Error updating user image:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------------
// PUT /api/user/:id/profile
// ---------------------------
// Update user profile with optional image upload
router.put('/:id/profile', upload.single('image'), async (req, res) => {
  const userId = req.params.id;
  const { username, email, phone } = req.body;

  try {
    let imageUrl = null;

    // If image is uploaded, upload to Cloudinary
    if (req.file) {
      const cloudResult = await cloudinary.uploader.upload(req.file.path);
      imageUrl = cloudResult.secure_url;
      
      // Remove local temp file
      fs.unlinkSync(req.file.path);
    }

    // Build update query dynamically based on provided fields
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (username) {
      updateFields.push(`username = $${paramCount}`);
      values.push(username);
      paramCount++;
    }

    if (email) {
      updateFields.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (phone) {
      updateFields.push(`phone = $${paramCount}`);
      values.push(phone);
      paramCount++;
    }

    if (imageUrl) {
      updateFields.push(`image_url = $${paramCount}`);
      values.push(imageUrl);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Add userId as last parameter
    values.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE userid = $${paramCount}
      RETURNING userid, username, email, phone, image_url
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating profile' 
    });
  }
});

module.exports = router;
