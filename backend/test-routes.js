const pool = require('./db.js');

async function testRoutes() {
  try {
    console.log('🧪 Testing API routes...');
    
    // Test kitchens query
    console.log('\n📋 Testing kitchens query...');
    const kitchensResult = await pool.query(`
      SELECT 
        k._id as kitchen_id,
        k.name as kitchen_name,
        k.description,
        k.address,
        k.phone,
        k.email,
        k.owner_id,
        u.name as owner_name,
        u.email as owner_email
      FROM kitchens k 
      LEFT JOIN users u ON k.owner_id = u._id
      ORDER BY k.created_at DESC
    `);
    
    console.log(`✅ Kitchens found: ${kitchensResult.rows.length}`);
    console.log('Sample kitchen data:', JSON.stringify(kitchensResult.rows[0], null, 2));
    
    // Test food query
    console.log('\n🍕 Testing food query...');
    const foodResult = await pool.query('SELECT * FROM food_items ORDER BY created_at DESC');
    
    console.log(`✅ Food items found: ${foodResult.rows.length}`);
    console.log('Sample food data:', JSON.stringify(foodResult.rows[0], null, 2));
    
  } catch (error) {
    console.error('❌ Error testing routes:', error.message);
  } finally {
    process.exit(0);
  }
}

testRoutes();
