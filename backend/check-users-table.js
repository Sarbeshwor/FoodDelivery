const pool = require('./db');

async function checkUsersTable() {
  try {
    console.log('Checking users table structure...');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log('Users table columns:');
    tableInfo.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUsersTable();
