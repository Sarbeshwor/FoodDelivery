const pool = require('./db');

async function checkFoodItemsTable() {
  try {
    console.log('🔍 Checking food_items table structure...');
    
    const foodItemsQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'food_items' 
      ORDER BY ordinal_position;
    `;
    
    const foodItemsResult = await pool.query(foodItemsQuery);
    console.log('\n🍽️ FOOD_ITEMS TABLE STRUCTURE:');
    console.table(foodItemsResult.rows);
    
    // Also check a sample row
    const sampleQuery = `SELECT * FROM food_items LIMIT 1;`;
    const sampleResult = await pool.query(sampleQuery);
    console.log('\n📊 SAMPLE FOOD_ITEMS DATA:');
    console.table(sampleResult.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking food_items table:', error);
    process.exit(1);
  }
}

checkFoodItemsTable();
