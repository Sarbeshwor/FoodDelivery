const pool = require('./db');

async function testLogin() {
  try {
    console.log('🧪 Testing login flow for kitchen user...');
    
    // Simulate the login process for user 7
    const userResult = await pool.query('SELECT * FROM users WHERE userid = 7');
    const user = userResult.rows[0];
    
    console.log('User found:', {
      id: user.userid,
      username: user.username,
      email: user.email
    });
    
    // Check roles
    const rolesResult = await pool.query(`
      SELECT r.rolename FROM role r
      JOIN user_role ur ON r.roleid = ur.roleid
      WHERE ur.userid = $1
    `, [user.userid]);
    
    const roles = rolesResult.rows.map(r => r.rolename);
    console.log('User roles:', roles);
    
    // Check for kitchen ownership
    let kitchenId = null;
    if (roles.includes("kitchen")) {
      const kitchenResult = await pool.query(
        'SELECT id FROM kitchens WHERE owner_id = $1',
        [user.userid]
      );
      
      if (kitchenResult.rows.length > 0) {
        kitchenId = kitchenResult.rows[0].id;
      }
    }
    
    console.log('Kitchen ID:', kitchenId);
    
    // This is what would be sent to frontend
    const loginResponse = {
      message: "Login successful",
      user: {
        id: user.userid,
        username: user.username,
        email: user.email,
        roles,
        kitchenId
      }
    };
    
    console.log('\n✅ Login response that would be sent to frontend:');
    console.log(JSON.stringify(loginResponse, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

testLogin();
