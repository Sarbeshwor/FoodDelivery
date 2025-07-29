const { Pool } = require('pg');
require('dotenv').config();

console.log('DB_PASSWORD type:', typeof process.env.DB_PASSWORD);
console.log('DB_PASSWORD value:', process.env.DB_PASSWORD);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD), // Ensure it's a string
  port: process.env.DB_PORT,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Connection successful!');
    
    const result = await client.query('SELECT COUNT(*) FROM delivery_assignments');
    console.log('Query result:', result.rows[0]);
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

testConnection();
