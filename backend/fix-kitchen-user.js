const pool = require('./db');

async function fixKitchenUser() {
  try {
    console.log('🔍 Checking existing kitchens...');
    
    // Check existing kitchens
    const kitchens = await pool.query('SELECT * FROM kitchens ORDER BY id');
    console.log('Existing kitchens:');
    console.table(kitchens.rows);
    
    // Check if user 7 already has a kitchen somehow
    const userKitchen = await pool.query('SELECT * FROM kitchens WHERE owner_id = 7');
    
    if (userKitchen.rows.length === 0) {
      console.log('\n🏗️ Creating kitchen for user 7...');
      
      // Create a kitchen for user 7
      const newKitchen = await pool.query(`
        INSERT INTO kitchens (name, owner_id)
        VALUES ($1, $2)
        RETURNING *
      `, [
        'Kitchen Admin',
        7
      ]);
      
      console.log('✅ Created new kitchen for user 7:');
      console.table(newKitchen.rows);
    } else {
      console.log('✅ User 7 already has a kitchen:');
      console.table(userKitchen.rows);
    }
    
    // Test the login flow for this user
    console.log('\n🧪 Testing kitchen ID retrieval for user 7...');
    const testKitchen = await pool.query('SELECT id FROM kitchens WHERE owner_id = 7');
    console.log('Kitchen ID for user 7:', testKitchen.rows[0]?.id || 'NOT FOUND');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

fixKitchenUser();
