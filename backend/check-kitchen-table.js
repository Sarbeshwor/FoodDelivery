const pool = require('./db');

async function checkKitchenTable() {
  try {
    console.log('🔍 Checking kitchens table structure...');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'kitchens' 
      ORDER BY ordinal_position
    `);
    
    console.log('Kitchens table structure:');
    console.table(result.rows);
    
    // Also check a sample row
    const sample = await pool.query('SELECT * FROM kitchens LIMIT 1');
    console.log('\nSample kitchen data:');
    console.table(sample.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

checkKitchenTable();
