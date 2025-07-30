const pool = require('./db');

async function testRatingEndpoint() {
  try {
    console.log('🧪 Testing rating endpoint...');
    
    // Get a delivered order to test with
    const orderQuery = `
      SELECT order_item_id, user_id, food_item_id, status
      FROM order_items 
      WHERE status = 'delivered' 
      LIMIT 1;
    `;
    
    const orderResult = await pool.query(orderQuery);
    
    if (orderResult.rows.length === 0) {
      console.log('❌ No delivered orders found for testing');
      process.exit(1);
    }
    
    const order = orderResult.rows[0];
    console.log('📦 Testing with order:', order);
    
    // Test the rating endpoint with fetch
    const testRating = {
      order_item_id: order.order_item_id,
      user_id: order.user_id,
      food_id: order.food_item_id,
      rating: 5
    };
    
    console.log('📡 Sending rating request:', testRating);
    
    const response = await fetch('http://localhost:5000/api/order/rate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRating)
    });
    
    const responseData = await response.json();
    
    console.log('📋 Response status:', response.status);
    console.log('📋 Response data:', responseData);
    
    if (response.ok) {
      console.log('✅ Rating endpoint is working!');
      
      // Check if rating was saved
      const savedRatingQuery = `
        SELECT * FROM food_ratings 
        WHERE order_item_id = $1 AND user_id = $2;
      `;
      
      const savedRating = await pool.query(savedRatingQuery, [order.order_item_id, order.user_id]);
      console.log('💾 Saved rating in database:', savedRating.rows);
      
      // Check if order_items was updated
      const updatedOrderQuery = `
        SELECT rating FROM order_items 
        WHERE order_item_id = $1;
      `;
      
      const updatedOrder = await pool.query(updatedOrderQuery, [order.order_item_id]);
      console.log('📝 Updated order rating:', updatedOrder.rows);
      
    } else {
      console.log('❌ Rating endpoint failed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing rating endpoint:', error);
    process.exit(1);
  }
}

testRatingEndpoint();
