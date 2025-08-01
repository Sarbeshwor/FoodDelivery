const pool = require('./db.js');

async function addSampleData() {
  try {
    console.log('🍕 Adding sample food data...');
    
    // First, add a sample kitchen
    const kitchenResult = await pool.query(`
      INSERT INTO kitchens (name, description, address, phone, email, status)
      VALUES ('Sample Kitchen', 'Delicious homemade food', '123 Food Street', '+1234567890', 'kitchen@example.com', 'active')
      RETURNING _id;
    `);
    
    const kitchenId = kitchenResult.rows[0]._id;
    console.log(`✅ Created sample kitchen with ID: ${kitchenId}`);
    
    // Add sample food items
    const foodItems = [
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella cheese, and basil',
        price: 12.99,
        category: 'Pizza',
        image: 'https://example.com/pizza.jpg'
      },
      {
        name: 'Chicken Burger',
        description: 'Grilled chicken breast with lettuce, tomato, and mayo',
        price: 8.99,
        category: 'Burgers',
        image: 'https://example.com/burger.jpg'
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with caesar dressing and croutons',
        price: 7.99,
        category: 'Salads',
        image: 'https://example.com/salad.jpg'
      }
    ];
    
    for (const item of foodItems) {
      await pool.query(`
        INSERT INTO food_items (name, description, price, category, image, kitchen_id, available)
        VALUES ($1, $2, $3, $4, $5, $6, true)
      `, [item.name, item.description, item.price, item.category, item.image, kitchenId]);
      
      console.log(`✅ Added: ${item.name}`);
    }
    
    // Check final count
    const countResult = await pool.query('SELECT COUNT(*) as count FROM food_items;');
    console.log(`\n🎉 Total food items: ${countResult.rows[0].count}`);
    
    console.log('\n✅ Sample data added successfully!');
    console.log('🔗 Now try: https://fooddelivery-uc9i.onrender.com/api/food');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
  } finally {
    process.exit(0);
  }
}

addSampleData();
