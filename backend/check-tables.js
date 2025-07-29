const pool = require('./db');

async function checkTables() {
  try {
    const result = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Available tables:');
    result.rows.forEach(row => console.log('- ' + row.table_name));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkTables();
