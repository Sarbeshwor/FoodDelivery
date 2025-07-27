const pool = require('../db');

async function createDeliveryApplication({ name, phone, email, vehicle, username, password }) {
  const query = `
    INSERT INTO delivery_applications (name, phone, email, vehicle, username, password)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [name, phone, email, vehicle, username, password];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

module.exports = {
  createDeliveryApplication,
}; 