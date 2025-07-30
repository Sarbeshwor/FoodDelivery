const pool = require('./db');

async function fixFoodRatingsTable() {
  try {
    console.log('🔧 Fixing food_ratings table structure...');
    
    // Drop the existing table and recreate it with proper structure
    const dropTableQuery = `DROP TABLE IF EXISTS food_ratings CASCADE;`;
    await pool.query(dropTableQuery);
    console.log('✅ Dropped existing food_ratings table');
    
    const createTableQuery = `
      CREATE TABLE food_ratings (
        id SERIAL PRIMARY KEY,
        order_item_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        food_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(userid) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES food_items(_id) ON DELETE CASCADE,
        FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id) ON DELETE CASCADE,
        UNIQUE(order_item_id, user_id)
      );
    `;

    await pool.query(createTableQuery);
    console.log('✅ Created food_ratings table with proper structure');

    // Add indexes for better performance
    const createIndexQuery1 = `CREATE INDEX IF NOT EXISTS idx_food_ratings_food_id ON food_ratings(food_id);`;
    const createIndexQuery2 = `CREATE INDEX IF NOT EXISTS idx_food_ratings_user_id ON food_ratings(user_id);`;
    const createIndexQuery3 = `CREATE INDEX IF NOT EXISTS idx_food_ratings_order_item_id ON food_ratings(order_item_id);`;

    await pool.query(createIndexQuery1);
    await pool.query(createIndexQuery2);
    await pool.query(createIndexQuery3);
    console.log('✅ Created indexes for better performance');

    console.log('🎉 Food ratings table fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing food_ratings table:', error);
    process.exit(1);
  }
}

fixFoodRatingsTable();
