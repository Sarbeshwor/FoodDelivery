const pool = require('./db');

async function checkOrderItems() {
  try {
    console.log('Checking order_items table structure...');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'order_items'
      ORDER BY ordinal_position
    `);
    console.log('order_items columns:', tableInfo.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkOrderItems();
