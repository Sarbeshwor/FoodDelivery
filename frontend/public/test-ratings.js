// Test ratings API endpoints directly
console.log('Testing ratings API...');

async function testRatings() {
  const foodIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  
  for (const id of foodIds) {
    try {
      const response = await fetch(`http://localhost:5000/api/order/food-ratings/${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`Food ID ${id}:`, data);
      } else {
        console.log(`Food ID ${id}: Error ${response.status}`);
      }
    } catch (error) {
      console.log(`Food ID ${id}: Network error`);
    }
  }
}

testRatings();
