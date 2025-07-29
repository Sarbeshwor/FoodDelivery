import React, { useContext } from "react";
import "./ExploreMenu.css";
import { StoreContext } from "../../context/StoreContext";

const ExploreMenu = ({ category, setCategory }) => {
  const { kitchenList, selectedKitchen, filterByKitchen, showAllFood } =
    useContext(StoreContext);

  const handleKitchenClick = (kitchenId, kitchenName) => {
    if (selectedKitchen === kitchenId) {
      // If clicking the same kitchen, show all
      setCategory("All");
      showAllFood();
    } else {
      // Filter by selected kitchen
      setCategory(kitchenName);
      filterByKitchen(kitchenId);
    }
  };

  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore Kitchens</h1>
      <p className="explore-menu-text">
        Get the taste of these famous kitchens near you
      </p>
      <div className="explore-menu-list">
        {/* Show All option */}
        <div
          onClick={() => {
            setCategory("All");
            showAllFood();
          }}
          className="explore-menu-list-item"
        >
          <img
            className={category === "All" ? "active" : ""}
            src="https://cdn-icons-png.flaticon.com/512/2936/2936886.png"
            alt="All Kitchens"
          />
          <p>All Kitchens</p>
        </div>

        {/* Kitchen items */}
        {kitchenList.map((kitchen) => {
          return (
            <div
              onClick={() =>
                handleKitchenClick(kitchen.kitchen_id, kitchen.kitchen_name)
              }
              key={kitchen.kitchen_id}
              className="explore-menu-list-item"
            >
              <img
                className={
                  selectedKitchen === kitchen.kitchen_id ? "active" : ""
                }
                src={
                  kitchen.image_url ||
                  "https://cdn-icons-png.flaticon.com/512/219/219988.png"
                }
                alt={kitchen.kitchen_name}
              />
              <p>{kitchen.kitchen_name}</p>
              <span className="kitchen-owner">by {kitchen.username}</span>
            </div>
          );
        })}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;
