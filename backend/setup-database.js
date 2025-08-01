const pool = require('./db.js');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database tables...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'database_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Reading database schema...');
    
    // Execute the schema
    await pool.query(schema);
    
    console.log('✅ Database schema executed successfully!');
    
    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    
    // Check food_items specifically
    const foodItemsCount = await pool.query('SELECT COUNT(*) as count FROM food_items;');
    console.log(`\n📊 food_items table: ${foodItemsCount.rows[0].count} records`);
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('Full error:', error);
  } finally {
    process.exit(0);
  }
}

setupDatabase();
