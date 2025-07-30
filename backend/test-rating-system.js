const pool = require('./db');

async function testRatingSystem() {
  try {
    console.log('🧪 Testing rating system...');
    
    // Check if we have any delivered orders to test with
    const deliveredOrdersQuery = `
      SELECT 
        oi.order_item_id,
        oi.user_id,
        oi.food_item_id,
        oi.status,
        oi.rating,
        fi.name as food_name,
        u.username
      FROM order_items oi
      JOIN food_items fi ON oi.food_item_id = fi._id
      JOIN users u ON oi.user_id = u.userid
      WHERE oi.status = 'delivered'
      LIMIT 5;
    `;
    
    const deliveredOrders = await pool.query(deliveredOrdersQuery);
    console.log('\n📦 DELIVERED ORDERS (for testing):');
    console.table(deliveredOrders.rows);
    
    if (deliveredOrders.rows.length === 0) {
      console.log('\n🔄 Creating test data - updating an order to delivered status...');
      
      // Find a pending order and mark it as delivered for testing
      const pendingOrderQuery = `
        SELECT order_item_id, user_id, food_item_id 
        FROM order_items 
        WHERE status = 'pending' 
        LIMIT 1;
      `;
      
      const pendingOrders = await pool.query(pendingOrderQuery);
      
      if (pendingOrders.rows.length > 0) {
        const order = pendingOrders.rows[0];
        await pool.query(
          'UPDATE order_items SET status = $1 WHERE order_item_id = $2',
          ['delivered', order.order_item_id]
        );
        
        console.log(`✅ Updated order ${order.order_item_id} to delivered status for testing`);
        
        // Re-run the query to show the updated data
        const updatedOrders = await pool.query(deliveredOrdersQuery);
        console.log('\n📦 UPDATED DELIVERED ORDERS:');
        console.table(updatedOrders.rows);
      } else {
        console.log('❌ No orders found to test with');
        process.exit(1);
      }
    }
    
    // Check current food_ratings table
    const ratingsQuery = `SELECT * FROM food_ratings ORDER BY created_at DESC LIMIT 5;`;
    const ratings = await pool.query(ratingsQuery);
    console.log('\n⭐ CURRENT RATINGS:');
    console.table(ratings.rows);
    
    console.log('\n✅ Rating system is ready for testing!');
    console.log('🎯 Test steps:');
    console.log('1. Login to frontend with a user that has delivered orders');
    console.log('2. Go to Profile → Orders tab');
    console.log('3. Look for delivered orders with "Rate Order" button');
    console.log('4. Click "Rate Order" and submit a rating');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing rating system:', error);
    process.exit(1);
  }
}

testRatingSystem();
