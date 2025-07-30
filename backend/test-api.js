const axios = require('axios');

async function testFoodItemsAPI() {
  try {
    console.log('🧪 Testing /api/food-items endpoint...');
    
    // Test without kitchenId
    console.log('\n1. Testing without kitchenId parameter:');
    try {
      const response1 = await axios.get('http://localhost:5000/api/food-items');
      console.log('✅ Success:', response1.data.length, 'items returned');
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    }
    
    // Test with kitchenId = 4 (our newly created kitchen)
    console.log('\n2. Testing with kitchenId=4:');
    try {
      const response2 = await axios.get('http://localhost:5000/api/food-items?kitchenId=4');
      console.log('✅ Success:', response2.data.length, 'items returned');
      console.log('Items:', response2.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    }
    
    // Test with other existing kitchenIds
    console.log('\n3. Testing with kitchenId=1:');
    try {
      const response3 = await axios.get('http://localhost:5000/api/food-items?kitchenId=1');
      console.log('✅ Success:', response3.data.length, 'items returned');
      if (response3.data.length > 0) {
        console.log('Sample item:', response3.data[0]);
      }
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    }
    
    console.log('\n✅ API testing completed');
    
  } catch (err) {
    console.error('❌ Error running tests:', err.message);
  }
}

testFoodItemsAPI();
