import React, { useEffect, useState } from "react";
import "./List.css";

const List = () => {
  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchFoodItems = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.kitchenId) {
        throw new Error("Kitchen ID not found. Please log in again.");
      }

      console.log("Fetching items for kitchenId:", user.kitchenId);

      const response = await fetch(
        `http://localhost:5000/api/food-items?kitchenId=${user.kitchenId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched food items:", data);
      setFoodList(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch food items:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  fetchFoodItems();
}, []);


  const handleEdit = (id) => {
    console.log("Edit clicked for id:", id);
    // Add your edit logic here (e.g., open modal or navigate)
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/food-items/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setFoodList((prevList) => prevList.filter((item) => item._id !== id));

      console.log(`Item with id ${id} deleted successfully`);
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert("Failed to delete item. Please try again.");
    }
  };

  if (loading) return <div className="loading">Loading food items...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  if (foodList.length === 0) return <div>No food items found.</div>;

  return (
    <div className="list add flex-col">
      <p>Your Items</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {foodList.map((item, index) => {
          return (
            <div key={index} className="list-table-format">
              <img className="imgs" src={item.image} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>BDT {item.price}</p>
              <p
                className="cursor"
                onClick={() => handleDelete(item._id)}
                title="Delete Item"
              >
                X
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default List;
