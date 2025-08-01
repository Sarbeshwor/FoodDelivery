import React, { useEffect, useState } from "react";
import "./List.css";
import { toast } from "react-toastify";

const List = () => {
  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ isOpen: false, item: null });
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
  });

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

  const handleEdit = (item) => {
    console.log("Edit clicked for item:", item);
    setEditForm({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description || "",
    });
    setEditModal({ isOpen: true, item });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModal.item) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/food-items/${editModal.item._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update the local state
      setFoodList((prevList) =>
        prevList.map((item) =>
          item._id === editModal.item._id ? { ...item, ...editForm } : item
        )
      );

      console.log(`Item updated successfully`);

      toast.success("Item updated successfully!");
      setEditModal({ isOpen: false, item: null });
    } catch (err) {
      console.error("Failed to update item:", err);
      toast.error("Failed to update item. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeModal = () => {
    setEditModal({ isOpen: false, item: null });
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
      toast.error("Failed to delete item. Please try again.");
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
              <div className="action-buttons">
                <p
                  className="cursor edit-btn"
                  onClick={() => handleEdit(item)}
                  title="Edit Item"
                >
                  ✏️
                </p>
                <p
                  className="cursor delete-btn"
                  onClick={() => handleDelete(item._id)}
                  title="Delete Item"
                >
                  X
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Food Item</h2>
              <span className="close-btn" onClick={closeModal}>
                &times;
              </span>
            </div>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category:</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={editForm.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price:</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={editForm.price}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-buttons">
                <button
                  type="button"
                  onClick={closeModal}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
