const pool = require('./db');

async function createFoodRatingsTable() {
  try {
    console.log('🚀 Starting food_ratings table creation...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS food_ratings (
        id SERIAL PRIMARY KEY,
        order_item_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        food_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES food_items(_id) ON DELETE CASCADE,
        UNIQUE(order_item_id, user_id)
      );
    `;

    await pool.query(createTableQuery);
    console.log('✅ food_ratings table created successfully');

    // Add index for better performance
    const createIndexQuery1 = `CREATE INDEX IF NOT EXISTS idx_food_ratings_food_id ON food_ratings(food_id);`;
    const createIndexQuery2 = `CREATE INDEX IF NOT EXISTS idx_food_ratings_user_id ON food_ratings(user_id);`;

    await pool.query(createIndexQuery1);
    await pool.query(createIndexQuery2);
    console.log('✅ Indexes created successfully');

    // Add rating column to order_items table if it doesn't exist
    try {
      const addRatingColumnQuery = `
        ALTER TABLE order_items 
        ADD COLUMN IF NOT EXISTS rating INTEGER;
      `;
      await pool.query(addRatingColumnQuery);
      console.log('✅ Rating column added to order_items table');
    } catch (error) {
      console.log('ℹ️  Rating column might already exist in order_items table:', error.message);
    }

    console.log('🎉 Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating food_ratings table:', error);
    process.exit(1);
  }
}

createFoodRatingsTable();
