const pool = require('./db');

async function checkDatabase() {
  try {
    console.log('Checking delivery assignments...');
    const deliveryAssignments = await pool.query('SELECT * FROM delivery_assignments LIMIT 5');
    console.log('Delivery assignments:', deliveryAssignments.rows);
    
    console.log('\nChecking orders with onitsway status...');
    const onItsWayOrders = await pool.query("SELECT * FROM order_items WHERE status = 'onitsway' LIMIT 5");
    console.log('Orders on its way:', onItsWayOrders.rows);
    
    console.log('\nChecking all order statuses...');
    const allStatuses = await pool.query('SELECT status, COUNT(*) FROM order_items GROUP BY status');
    console.log('Order status counts:', allStatuses.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkDatabase();
