const pool = require('./db.js');

async function checkTables() {
  try {
    console.log('Checking database tables...');
    
    // Check all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Available tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check if food_items table exists
    const foodItemsCheck = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'food_items';
    `);
    
    if (parseInt(foodItemsCheck.rows[0].count) > 0) {
      console.log('\n✅ food_items table exists');
      
      // Check food_items structure
      const structureResult = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'food_items' 
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📊 food_items table structure:');
      structureResult.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Check sample data
      const sampleData = await pool.query('SELECT COUNT(*) as count FROM food_items LIMIT 1;');
      console.log(`\n📈 food_items has ${sampleData.rows[0].count} records`);
      
    } else {
      console.log('\n❌ food_items table does NOT exist');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    process.exit(0);
  }
}

checkTables();
