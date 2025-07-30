const axios = require('axios');

async function getFoodItems() {
  try {
    const response = await axios.get('http://localhost:5000/api/food');
    console.log('Food items:');
    response.data.forEach(item => {
      console.log(`ID: ${item._id}, Name: ${item.name}, Category: ${item.category}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getFoodItems();
