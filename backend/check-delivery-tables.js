const pool = require('./db');

async function checkTables() {
  try {
    console.log('Checking all tables...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('Available tables:', tables.rows.map(r => r.table_name));
    
    // Check delivery_locations table
    try {
      const deliveryLocations = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'delivery_locations'
        ORDER BY ordinal_position
      `);
      console.log('\ndelivery_locations columns:', deliveryLocations.rows);
    } catch (e) {
      console.log('delivery_locations table not found');
    }
    
    // Check if location table exists (singular)
    try {
      const location = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'location'
        ORDER BY ordinal_position
      `);
      console.log('\nlocation columns:', location.rows);
      if (location.rows.length === 0) {
        console.log('location table exists but has no columns or is empty');
      }
    } catch (e) {
      console.log('location table not found');
    }
    
    // Check for any table that contains 'location'
    const locationTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%location%' AND table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('\nAll location-related tables:', locationTables.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkTables();
