const pool = require('./db');

async function checkUsersKitchens() {
  try {
    console.log('🔍 Checking users and their kitchen associations...');
    
    const result = await pool.query(`
      SELECT u.userid, u.username, u.email, 
             array_agg(r.rolename) as roles,
             k.id as kitchen_id, k.name as kitchen_name
      FROM users u 
      LEFT JOIN user_role ur ON u.userid = ur.userid
      LEFT JOIN role r ON ur.roleid = r.roleid
      LEFT JOIN kitchens k ON k.owner_id = u.userid
      GROUP BY u.userid, u.username, u.email, k.id, k.name
      ORDER BY u.userid
    `);
    
    console.log('Users and their kitchens:');
    console.table(result.rows);
    
    // Also check if any user has kitchen role but no kitchen
    const kitchenRoleUsers = await pool.query(`
      SELECT u.userid, u.username, u.email
      FROM users u 
      JOIN user_role ur ON u.userid = ur.userid
      JOIN role r ON ur.roleid = r.roleid
      WHERE r.rolename = 'kitchen'
    `);
    
    console.log('\nUsers with kitchen role:');
    console.table(kitchenRoleUsers.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUsersKitchens();
