const pool = require('./db');

async function testAndCreateRatingData() {
  try {
    console.log('🧪 Testing food ratings API and adding test data...');
    
    // First, let's check what food items we have
    const foodItemsQuery = `SELECT _id, name FROM food_items LIMIT 5;`;
    const foodItems = await pool.query(foodItemsQuery);
    
    console.log('\n🍽️ Available food items:');
    console.table(foodItems.rows);
    
    if (foodItems.rows.length === 0) {
      console.log('❌ No food items found');
      process.exit(1);
    }
    
    // Test the rating API for each food item
    console.log('\n📡 Testing rating API endpoints...');
    
    for (const food of foodItems.rows) {
      const response = await fetch(`http://localhost:5000/api/order/food-ratings/${food._id}`);
      const data = await response.json();
      
      console.log(`Food "${food.name}" (ID: ${food._id}):`, {
        average: data.average_rating,
        total: data.total_ratings
      });
    }
    
    // Add some test ratings if there are none
    const testFoodId = foodItems.rows[0]._id;
    const existingRatingsQuery = `SELECT COUNT(*) FROM food_ratings WHERE food_id = $1`;
    const existingRatings = await pool.query(existingRatingsQuery, [testFoodId]);
    
    if (parseInt(existingRatings.rows[0].count) === 0) {
      console.log('\n🎯 Adding test ratings...');
      
      // Add some dummy ratings for testing
      const testRatings = [
        { order_item_id: 7, user_id: 2, food_id: testFoodId, rating: 5 },
        { order_item_id: 8, user_id: 2, food_id: testFoodId, rating: 4 },
        { order_item_id: 9, user_id: 2, food_id: testFoodId, rating: 5 },
      ];
      
      for (const rating of testRatings) {
        try {
          await pool.query(
            'INSERT INTO food_ratings (order_item_id, user_id, food_id, rating) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
            [rating.order_item_id, rating.user_id, rating.food_id, rating.rating]
          );
        } catch (error) {
          console.log(`Note: Rating for order ${rating.order_item_id} might already exist`);
        }
      }
      
      console.log('✅ Test ratings added');
      
      // Test the API again
      const retestResponse = await fetch(`http://localhost:5000/api/order/food-ratings/${testFoodId}`);
      const retestData = await retestResponse.json();
      
      console.log(`\n📊 Updated ratings for food ID ${testFoodId}:`, {
        average: retestData.average_rating,
        total: retestData.total_ratings
      });
    }
    
    console.log('\n✅ Rating system test completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error testing ratings:', error);
    process.exit(1);
  }
}

testAndCreateRatingData();
