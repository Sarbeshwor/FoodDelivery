// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173', 'https://food-delivery-kxin.vercel.app'],
  credentials: true
}));

// Import routes
const foodItemsRouter = require('./routes/foodItems');
const authRouter = require('./routes/auth');

// Use routes
app.use('/api/food-items', foodItemsRouter);
app.use('/api/auth', authRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
