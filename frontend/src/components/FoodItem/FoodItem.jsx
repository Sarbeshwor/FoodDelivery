import React, { useContext } from "react";
import "./FoodItem.css";

import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart, foodRatings } =
    useContext(StoreContext);

  // Get rating data for this food item
  const ratingData = foodRatings[id] || { average_rating: 0, total_ratings: 0 };

  // Format rating display
  const formatRating = () => {
    if (ratingData.total_ratings === 0) {
      return <span className="no-rating">No ratings</span>;
    }

    return (
      <span className="rating-display">
        <span className="rating-stars">
          {"★".repeat(Math.floor(ratingData.average_rating))}
          {"☆".repeat(5 - Math.floor(ratingData.average_rating))}
        </span>
        <span className="rating-text">
          {ratingData.average_rating}({ratingData.total_ratings})
        </span>
      </span>
    );
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img className="food-item-image" src={image} alt="" />
        {!cartItems[id] ? (
          <img
            className="add"
            onClick={() => addToCart(id)}
            src={assets.add_icon_white}
          />
        ) : (
          <div className="food-item-counter">
            <img
              onClick={() => removeFromCart(id)}
              src={assets.remove_icon_red}
              alt=""
            />
            <p>{cartItems[id]}</p>
            <img
              onClick={() => addToCart(id)}
              src={assets.add_icon_green}
              alt=""
            />
          </div>
        )}
      </div>
      <div className="foot-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          {formatRating()}
        </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-price">BDT {price}</p>
      </div>
    </div>
  );
};

export default FoodItem;
