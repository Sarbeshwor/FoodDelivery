const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// Register route
router.post('/register', async (req, res) => {
  const { username, email, password, type } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "Missing required fields." });

  try {
    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0)
      return res.status(409).json({ message: "User already exists." });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user and get new user id
    const newUserResult = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );
    const newUser = newUserResult.rows[0];

    // Get RoleID from role name (type)
    const roleResult = await pool.query('SELECT RoleID FROM role WHERE RoleName = $1', [type]);
    if (roleResult.rows.length === 0) {
      // Role not found, optional: assign default role or error
      return res.status(400).json({ message: "Invalid role type." });
    }
    const roleId = roleResult.rows[0].roleid;

    // Insert into user_role mapping
    await pool.query('INSERT INTO user_role (userid, roleid) VALUES ($1, $2)', [newUser.userid, roleId]);

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing email or password." });

  try {
    // Fetch user by email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0)
      return res.status(401).json({ message: "Invalid email or password." });

    const user = userResult.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password." });

    // Fetch roles of the user
    const rolesResult = await pool.query(
      `SELECT r.rolename FROM role r
       JOIN user_role ur ON r.roleid = ur.roleid
       WHERE ur.userid = $1`, [user.userid]
    );

    const roles = rolesResult.rows.map(r => r.rolename);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.userid,
        username: user.username,
        email: user.email,
        roles,  // send roles array
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
