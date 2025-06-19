import React, { useContext, useState } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { assets, menu_list } from "../../assets/assets";

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  const [showFilter, setShowFilter] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleCategoryChange = (menu_name) => {
    if (selectedCategories.includes(menu_name)) {
      setSelectedCategories(
        selectedCategories.filter((cat) => cat !== menu_name)
      );
    } else {
      setSelectedCategories([...selectedCategories, menu_name]);
    }
  };

  const filteredFood =
    selectedCategories.length === 0
      ? food_list
      : food_list.filter((item) => selectedCategories.includes(item.category));

  return (
    <div className="food-display" id="food-display">
      {}
      <div className="food-display-header">
        <h2>Trending dishes</h2>
        <img
          src={assets.filter}
          alt="Filter"
          className="filter-icon-btn"
          onClick={() => setShowFilter(!showFilter)}
        />
      </div>
      {}
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
            onClick={() => setSelectedCategories([])}
          >
            Clear All
          </button>
        </div>
      )}
      
      <div className="food-display-list">
        {filteredFood.map((item, index) => (
          <FoodItem
            key={index}
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
