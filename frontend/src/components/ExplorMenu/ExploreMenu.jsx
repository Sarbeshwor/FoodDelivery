import React from "react";
import "./ExploreMenu.css";
import { user_list } from "../../assets/assets";

const ExploreMenu = ({ category, setCategory }) => {
  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore Menu</h1>
      <p className="explore-menu-text">
        Get the taste of this famous kitchens near you
      </p>
      <div className="explore-menu-list">
        {user_list.map((item, index) => {
          return (
            <div
              onClick={() =>
                setCategory((prev) =>
                  prev == item.user_name ? "All" : item.user_name
                )
              }
              key={index}
              className="explore-menu-list-item"
            >
              <img
                className={category == item.user_name ? "active" : ""}
                src={item.user_pic}
                alt=""
              />
              <p>{item.user_name}</p>
            </div>
          );
        })}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;
