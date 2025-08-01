const pool = require('./db.js');
const fs = require('fs');
const path = require('path');

async function setupProductionDatabase() {
  try {
    console.log('🚀 Setting up production database...');
    
    // Check if tables already exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'food_items';
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ Tables already exist. Checking data...');
      
      // Check if we have data
      const foodCount = await pool.query('SELECT COUNT(*) as count FROM food_items;');
      const kitchenCount = await pool.query('SELECT COUNT(*) as count FROM kitchens;');
      
      console.log(`📊 Current data: ${foodCount.rows[0].count} food items, ${kitchenCount.rows[0].count} kitchens`);
      
      if (parseInt(foodCount.rows[0].count) > 0 && parseInt(kitchenCount.rows[0].count) > 0) {
        console.log('✅ Database already has data. Skipping setup.');
        return;
      }
    }
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'database_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schema);
      console.log('✅ Database schema executed');
    }
    
    // Add sample kitchen if none exists
    const kitchenCheckResult = await pool.query('SELECT COUNT(*) as count FROM kitchens;');
    if (parseInt(kitchenCheckResult.rows[0].count) === 0) {
      const kitchenResult = await pool.query(`
        INSERT INTO kitchens (name, description, address, phone, email, status)
        VALUES ('Delicious Eats Kitchen', 'Fresh and tasty homemade meals', '456 Culinary Ave', '+1234567890', 'info@deliciouseats.com', 'active')
        RETURNING _id;
      `);
      
      const kitchenId = kitchenResult.rows[0]._id;
      console.log(`✅ Created kitchen with ID: ${kitchenId}`);
      
      // Add sample food items
      const foodItems = [
        {
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil',
          price: 14.99,
          category: 'Pizza',
          image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400'
        },
        {
          name: 'Grilled Chicken Burger',
          description: 'Juicy grilled chicken breast with lettuce, tomato, and special sauce',
          price: 11.99,
          category: 'Burgers',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
        },
        {
          name: 'Fresh Caesar Salad',
          description: 'Crisp romaine lettuce with caesar dressing, croutons, and parmesan',
          price: 9.99,
          category: 'Salads',
          image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400'
        },
        {
          name: 'Chicken Biryani',
          description: 'Aromatic basmati rice with tender chicken and traditional spices',
          price: 16.99,
          category: 'Rice Dishes',
          image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'
        },
        {
          name: 'Vegetable Stir Fry',
          description: 'Fresh mixed vegetables wok-fried with garlic and ginger',
          price: 12.99,
          category: 'Vegetarian',
          image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400'
        }
      ];
      
      for (const item of foodItems) {
        await pool.query(`
          INSERT INTO food_items (name, description, price, category, image, kitchen_id, available)
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [item.name, item.description, item.price, item.category, item.image, kitchenId]);
        
        console.log(`✅ Added: ${item.name}`);
      }
    }
    
    // Final verification
    const finalFoodCount = await pool.query('SELECT COUNT(*) as count FROM food_items;');
    const finalKitchenCount = await pool.query('SELECT COUNT(*) as count FROM kitchens;');
    
    console.log(`\n🎉 Setup complete!`);
    console.log(`📊 Database now has: ${finalFoodCount.rows[0].count} food items, ${finalKitchenCount.rows[0].count} kitchens`);
    console.log(`🔗 API endpoints should now work!`);
    
  } catch (error) {
    console.error('❌ Error setting up production database:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

setupProductionDatabase();
