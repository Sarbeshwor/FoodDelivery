import React, { useContext, useState } from "react";
import "./FoodDisplay.css";
import FoodItem from "../FoodItem/FoodItem";
import { assets, menu_list } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";

const FoodDisplay = ({ category }) => {
  // Get food list and search query from context
  const { foodList, searchQuery } = useContext(StoreContext);

  // Local state for filter UI
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Handle category checkbox toggle
  const handleCategoryChange = (menu_name) => {
    if (selectedCategories.includes(menu_name)) {
      setSelectedCategories(
        selectedCategories.filter((cat) => cat !== menu_name)
      );
    } else {
      setSelectedCategories([...selectedCategories, menu_name]);
    }
  };

  // Filtered food based on selected categories and search query
  // Note: foodList is already filtered by kitchen in the context
  let filteredFood = foodList;

  // Apply category filter
  if (selectedCategories.length > 0) {
    filteredFood = filteredFood.filter((item) => 
      selectedCategories.includes(item.category)
    );
  }

  // Apply search filter
  if (searchQuery.trim()) {
    filteredFood = filteredFood.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="food-display" id="food-display">
      <div className="food-display-header">
        <h2>
          {searchQuery.trim() 
            ? `Search results for "${searchQuery}"`
            : category && category !== "All"
            ? `Dishes from ${category}`
            : "Trending dishes"
          }
        </h2>
        <img
          src={assets.filter}
          alt="Filter"
          className="filter-icon-btn"
          onClick={() => setShowFilter(!showFilter)}
        />
      </div>

      {showFilter && (
        <div className="filter-panel">
          {menu_list.map((menu, index) => (
            <label key={index} className="filter-option">
              <input
                type="checkbox"
                value={menu.menu_name}
                checked={selectedCategories.includes(menu.menu_name)}
                onChange={() => handleCategoryChange(menu.menu_name)}
              />
              {menu.menu_name}
            </label>
          ))}
        </div>
      )}

      {selectedCategories.length > 0 && (
        <div className="active-filters">
          {selectedCategories.map((category, index) => (
            <div key={index} className="filter-tag">
              {category}
              <span
                className="remove-tag"
                onClick={() =>
                  setSelectedCategories(
                    selectedCategories.filter((cat) => cat !== category)
                  )
                }
              >
                &times;
              </span>
            </div>
          ))}

          <button
            className="clear-all-btn"
            onClick={() => {
              setSelectedCategories([]);
              setShowFilter(false);
            }}
          >
            Clear All
          </button>
        </div>
      )}

      <div className="food-display-list">
        {filteredFood.length > 0 ? (
          filteredFood.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              price={item.price}
              description={item.description}
              image={item.image}
            />
          ))
        ) : (
          <div className="no-results">
            <p>
              {searchQuery.trim() 
                ? `No food items found for "${searchQuery}"`
                : selectedCategories.length > 0 
                ? "No food items found in selected categories"
                : "No food items available"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;
