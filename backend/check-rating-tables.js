const pool = require('./db');

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...');
    
    // Check order_items table structure
    const orderItemsQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'order_items' 
      ORDER BY ordinal_position;
    `;
    
    const orderItemsResult = await pool.query(orderItemsQuery);
    console.log('\n📋 ORDER_ITEMS TABLE STRUCTURE:');
    console.table(orderItemsResult.rows);
    
    // Check if food_ratings table exists
    const foodRatingsQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'food_ratings' 
      ORDER BY ordinal_position;
    `;
    
    const foodRatingsResult = await pool.query(foodRatingsQuery);
    console.log('\n⭐ FOOD_RATINGS TABLE STRUCTURE:');
    console.table(foodRatingsResult.rows);
    
    // Check sample data
    const sampleOrdersQuery = `
      SELECT order_item_id, status, rating, food_item_id, user_id 
      FROM order_items 
      LIMIT 5;
    `;
    
    const sampleOrdersResult = await pool.query(sampleOrdersQuery);
    console.log('\n📊 SAMPLE ORDER_ITEMS DATA:');
    console.table(sampleOrdersResult.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    process.exit(1);
  }
}

checkTables();
