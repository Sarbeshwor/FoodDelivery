import React, { useContext, useState } from "react";
import "./FoodDisplay.css";
import FoodItem from "../FoodItem/FoodItem";
import { assets, menu_list } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";

const FoodDisplay = ({ category }) => {
  // Get food list from context instead of local state
  const { foodList } = useContext(StoreContext);

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

  // Filtered food based on selected categories
  // Note: foodList is already filtered by kitchen in the context
  const filteredFood =
    selectedCategories.length === 0
      ? foodList
      : foodList.filter((item) => selectedCategories.includes(item.category));

  return (
    <div className="food-display" id="food-display">
      <div className="food-display-header">
        <h2>
          {category && category !== "All"
            ? `Dishes from ${category}`
            : "Trending dishes"}
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
        {filteredFood.map((item) => (
          <FoodItem
            key={item._id}
            id={item._id}
            name={item.name}
            price={item.price}
            description={item.description}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default FoodDisplay;
