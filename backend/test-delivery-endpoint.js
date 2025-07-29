const pool = require('./db');

async function testDeliveryEndpoint() {
  try {
    const delivery_user_id = 15; // Test with user ID 15 since we know they have assignments
    
    const query = `
      SELECT 
        da.id,
        da.order_item_id,
        da.delivery_user_id,
        da.assigned_at,
        oi.quantity,
        oi.status,
        oi.ordered_at,
        u.username AS customer_name,
        fi.name AS item_name,
        fi.image,
        fi.price,
        dl.street,
        dl.city,
        dl.postal_code AS zipcode,
        dl.country,
        CONCAT(dl.first_name, ' ', dl.last_name) AS customer_full_name,
        dl.phone
      FROM delivery_assignments da
      JOIN order_items oi ON da.order_item_id = oi.order_item_id
      JOIN users u ON oi.user_id = u.userid
      JOIN food_items fi ON oi.food_item_id = fi._id
      LEFT JOIN delivery_locations dl ON oi.user_id = dl.userid
      WHERE da.delivery_user_id = $1
      ORDER BY da.assigned_at DESC
    `;
    
    const result = await pool.query(query, [delivery_user_id]);
    console.log(`Found ${result.rows.length} deliveries for user ${delivery_user_id}`);
    console.log('Deliveries:', JSON.stringify(result.rows, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testDeliveryEndpoint();
