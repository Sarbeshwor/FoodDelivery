const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'ADMIN',
  database: 'fooddeldata',
  port: 5432,
});

async function checkRatings() {
  try {
    console.log('=== Checking food_ratings table ===');
    const ratingsResult = await pool.query('SELECT * FROM food_ratings ORDER BY food_id');
    console.log('Food ratings data:', ratingsResult.rows);
    
    console.log('\n=== Checking order_items ratings ===');
    const orderItemsResult = await pool.query('SELECT food_id, rating FROM order_items WHERE rating IS NOT NULL ORDER BY food_id');
    console.log('Order items with ratings:', orderItemsResult.rows);
    
    console.log('\n=== Testing aggregation query for food_id 1 ===');
    const aggResult = await pool.query(`
      SELECT 
        ROUND(AVG(rating::numeric), 1) as average_rating,
        COUNT(*) as total_ratings
      FROM food_ratings 
      WHERE food_id = $1
    `, [1]);
    console.log('Aggregation for food_id 1:', aggResult.rows[0]);
    
    console.log('\n=== Testing aggregation query for all food_ids ===');
    const allFoodIds = await pool.query('SELECT DISTINCT food_id FROM food_ratings ORDER BY food_id');
    for (const row of allFoodIds.rows) {
      const foodId = row.food_id;
      const aggResult = await pool.query(`
        SELECT 
          ROUND(AVG(rating::numeric), 1) as average_rating,
          COUNT(*) as total_ratings
        FROM food_ratings 
        WHERE food_id = $1
      `, [foodId]);
      console.log(`Food ID ${foodId}:`, aggResult.rows[0]);
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkRatings();
