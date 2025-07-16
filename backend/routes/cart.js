const express = require("express");
const router = express.Router();
const pool = require("../db"); // assumes you setup pg pool in db.js

// Add item to cart or increase quantity
router.post("/add", async (req, res) => {
  const { userId, foodItemId } = req.body;
  if (!userId || !foodItemId) {
    return res.status(400).json({ error: "Missing userId or foodItemId" });
  }

  try {
    // Find or create cart for user
    let cartResult = await pool.query(
      "SELECT cart_id FROM carts WHERE user_id = $1",
      [userId]
    );

    let cartId;
    if (cartResult.rows.length === 0) {
      // create cart
      const insertCart = await pool.query(
        "INSERT INTO carts(user_id) VALUES ($1) RETURNING cart_id",
        [userId]
      );
      cartId = insertCart.rows[0].cart_id;
    } else {
      cartId = cartResult.rows[0].cart_id;
    }

    // Insert or update quantity in cart_items
    await pool.query(
      `INSERT INTO cart_items(cart_id, food_item_id, quantity)
       VALUES ($1, $2, 1)
       ON CONFLICT (cart_id, food_item_id)
       DO UPDATE SET quantity = cart_items.quantity + 1`,
      [cartId, foodItemId]
    );

    res.json({ message: "Added to cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Remove one quantity or remove item entirely
router.post("/remove", async (req, res) => {
  const { userId, foodItemId } = req.body;
  if (!userId || !foodItemId) {
    return res.status(400).json({ error: "Missing userId or foodItemId" });
  }

  try {
    // Get cart_id
    const cartResult = await pool.query(
      "SELECT cart_id FROM carts WHERE user_id = $1",
      [userId]
    );
    if (cartResult.rows.length === 0) {
      return res.status(400).json({ error: "Cart not found" });
    }
    const cartId = cartResult.rows[0].cart_id;

    // Get current quantity
    const itemResult = await pool.query(
      `SELECT quantity FROM cart_items WHERE cart_id = $1 AND food_item_id = $2`,
      [cartId, foodItemId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(400).json({ error: "Item not in cart" });
    }

    const currentQty = itemResult.rows[0].quantity;

    if (currentQty <= 1) {
      // Delete the item
      await pool.query(
        `DELETE FROM cart_items WHERE cart_id = $1 AND food_item_id = $2`,
        [cartId, foodItemId]
      );
    } else {
      // Decrement quantity by 1
      await pool.query(
        `UPDATE cart_items SET quantity = quantity - 1 WHERE cart_id = $1 AND food_item_id = $2`,
        [cartId, foodItemId]
      );
    }

    res.json({ message: "Removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get current cart items for user
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const cartResult = await pool.query(
      `SELECT c.cart_id FROM carts c WHERE c.user_id = $1`,
      [userId]
    );
    if (cartResult.rows.length === 0) {
      return res.json({ cartItems: [] });
    }
    const cartId = cartResult.rows[0].cart_id;

    // Join cart_items with food_items to get full info
    const itemsResult = await pool.query(
      `SELECT fi._id, fi.name, fi.price, fi.description, fi.image, ci.quantity
       FROM cart_items ci
       JOIN food_items fi ON ci.food_item_id = fi._id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    res.json({ cartItems: itemsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
