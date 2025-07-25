require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: true,       
  credentials: true, 
}));

app.use(express.json()); 

// Import your routers
const authRouter = require("./routes/auth");
const foodItemsRouter = require('./routes/foodItems');
const cartRouter = require("./routes/cart");

const foodRouter = require('./routes/food');


// Mount routers
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/food-items", foodItemsRouter); 
app.use('/api/food', foodRouter);
 
// app.use('/api/food', foodItemsRouter);


// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
