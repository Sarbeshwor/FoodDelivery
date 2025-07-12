import React, { useEffect, useState } from "react";
import "./List.css";

const List = () => {
  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/food-items", {
          credentials: "include",
        });
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

  const handleDelete = (id) => {
    console.log("Delete clicked for id:", id);
    // Add your delete logic here (e.g., confirmation and API call)
  };

  if (loading) return <div className="loading">Loading food items...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  if (foodList.length === 0) return <div>No food items found.</div>;

  return (
    <div className="list-container">
      <h2>Food Items List</h2>
      <div className="food-list">
        {foodList.map((item) => (
          <div className="food-card" key={item._id}>
            <div className="card-actions">
              <button
                className="icon-btn edit-btn"
                onClick={() => handleEdit(item._id)}
                title="Edit"
              >
                ✏️
              </button>
              <button
                className="icon-btn delete-btn"
                onClick={() => handleDelete(item._id)}
                title="Delete"
              >
                ❌
              </button>
            </div>
            <img
              src={item.image}
              alt={item.name}
              className="food-image"
              loading="lazy"
            />
            <div className="food-info">
              <h3>{item.name}</h3>
              <p className="category">{item.category}</p>
              <p className="description">{item.description}</p>
              <p className="price">${item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
