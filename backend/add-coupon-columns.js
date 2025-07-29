const pool = require('./db');

async function addCouponColumns() {
  try {
    console.log('Adding coupon columns to order_items table...');
    
    // Add coupon_code column
    await pool.query(`
      ALTER TABLE order_items 
      ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50)
    `);
    
    // Add discount_percent column
    await pool.query(`
      ALTER TABLE order_items 
      ADD COLUMN IF NOT EXISTS discount_percent INTEGER
    `);
    
    // Add discount_amount column
    await pool.query(`
      ALTER TABLE order_items 
      ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2)
    `);
    
    console.log('Coupon columns added successfully!');
    
    // Verify the changes
    const tableInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'order_items'
      ORDER BY ordinal_position
    `);
    console.log('Updated order_items columns:', tableInfo.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

addCouponColumns();
