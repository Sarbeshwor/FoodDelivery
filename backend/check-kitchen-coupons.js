const pool = require('./db');

async function checkKitchenCoupons() {
  try {
    console.log('Checking kitchen_coupons table structure...');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'kitchen_coupons'
      ORDER BY ordinal_position
    `);
    console.log('kitchen_coupons columns:', tableInfo.rows);
    
    if (tableInfo.rows.length > 0) {
      console.log('\nSample data from kitchen_coupons...');
      const sampleData = await pool.query('SELECT * FROM kitchen_coupons LIMIT 3');
      console.log('Sample kitchen_coupons:', sampleData.rows);
    } else {
      console.log('kitchen_coupons table not found or has no columns');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkKitchenCoupons();
