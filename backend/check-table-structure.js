const pool = require('./db');

async function checkTableStructure() {
  try {
    console.log('Checking delivery_locations table structure...');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'delivery_locations'
      ORDER BY ordinal_position
    `);
    console.log('delivery_locations columns:', tableInfo.rows);
    
    console.log('\nSample data from delivery_locations...');
    const sampleData = await pool.query('SELECT * FROM delivery_locations LIMIT 3');
    console.log('Sample delivery_locations:', sampleData.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkTableStructure();
