const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
  const { username, email, password, type } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "Missing required fields." });

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0)
      return res.status(409).json({ message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserResult = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );
    const newUser = newUserResult.rows[0];

    const roleResult = await pool.query('SELECT RoleID FROM role WHERE RoleName = $1', [type]);
    if (roleResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid role type." });
    }
    const roleId = roleResult.rows[0].roleid;

    await pool.query('INSERT INTO user_role (userid, roleid) VALUES ($1, $2)', [newUser.userid, roleId]);

    if (type === "kitchen") {
      await pool.query(
        'INSERT INTO kitchens (owner_id, name) VALUES ($1, $2)',
        [newUser.userid, username]
      );
    }

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing email or password." });

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0)
      return res.status(401).json({ message: "Invalid email or password." });

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password." });

    const rolesResult = await pool.query(
      `SELECT r.rolename FROM role r
       JOIN user_role ur ON r.roleid = ur.roleid
       WHERE ur.userid = $1`, [user.userid]
    );

    const roles = rolesResult.rows.map(r => r.rolename);

    // ✅ Check for kitchen ownership
    let kitchenId = null;
    if (roles.includes("kitchen")) {
      const kitchenResult = await pool.query(
        'SELECT id FROM kitchens WHERE owner_id = $1',
        [user.userid]
      );
      if (kitchenResult.rows.length > 0) {
        kitchenId = kitchenResult.rows[0].id;
      }
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.userid,
        username: user.username,
        email: user.email,
        roles,
        kitchenId, // ✅ Send it to frontend
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
