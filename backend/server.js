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
const foodItemsRouter = require("./routes/foodItems");
const deliveryApplicationRouter = require("./routes/deliveryApplication");

// Mount routers
app.use("/api/auth", authRouter);
app.use("/api/food-items", foodItemsRouter);  
app.use("/api/delivery-application", deliveryApplicationRouter);

// const foodItemsRouter = require('./routes/foodItems');
const cartRouter = require("./routes/cart");
const deliveryRoutes = require('./routes/delivery');
const foodRouter = require('./routes/food');
const orderRoutes = require('./routes/order');


// Mount routers

app.use("/api/cart", cartRouter);

app.use('/api/food', foodRouter);
app.use('/api/order', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
 
// app.use('/api/food', foodItemsRouter);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
