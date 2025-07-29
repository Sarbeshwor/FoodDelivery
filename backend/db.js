// db.js
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD), // Ensure it's a string
  port: process.env.DB_PORT,
  // ssl: {
  //   rejectUnauthorized: false
  // }
}); 

pool.connect()
  .then(() => console.log('Connected to PostgreSQL successfully'))
  .catch(err => console.error('PostgreSQL connection failed', err));

module.exports = pool;
