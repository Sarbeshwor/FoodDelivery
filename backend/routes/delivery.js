// routes/delivery.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // your PostgreSQL pool instance

// Get latest delivery info for a user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM delivery_locations WHERE userid = $1 LIMIT 1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No delivery info found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching delivery info:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save or update delivery info for a user
router.post('/save', async (req, res) => {
  const {
    userid,
    first_name,
    last_name,
    email,
    street,
    city,
    landmark,
    postal_code,
    country,
    phone,
  } = req.body;

  if (
    !userid ||
    !first_name ||
    !last_name ||
    !street ||
    !city ||
    !country ||
    !phone
  ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = `
      INSERT INTO delivery_locations
        (userid, first_name, last_name, email, street, city, landmark, postal_code, country, phone)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (userid)
      DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        street = EXCLUDED.street,
        city = EXCLUDED.city,
        landmark = EXCLUDED.landmark,
        postal_code = EXCLUDED.postal_code,
        country = EXCLUDED.country,
        phone = EXCLUDED.phone;
    `;

    await pool.query(query, [
      userid,
      first_name,
      last_name,
      email,
      street,
      city,
      landmark,
      postal_code,
      country,
      phone,
    ]);

    res.json({ message: 'Delivery info saved or updated successfully' });
  } catch (err) {
    console.error('Error saving delivery info:', err);
    res.status(500).json({ message: 'Error saving delivery info' });
  }
});

module.exports = router;
