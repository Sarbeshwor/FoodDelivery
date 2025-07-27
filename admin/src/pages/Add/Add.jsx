import React, { useState } from 'react';
import './Add.css';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = () => {
  const url = 'http://localhost:5000';

  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.error('Please upload an image');
      return;
    }

    if (!data.name || !data.price || !data.category) {
      toast.error('Please fill all required fields');
      return;
    }

    // ✅ Get user and kitchenId from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const kitchenId = user?.kitchenId;

    if (!kitchenId) {
      toast.error('Kitchen ID missing. Please re-login.');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('category', data.category);
    formData.append('kitchenId', kitchenId); // ✅ Send correct kitchenId

    try {
      setLoading(true);

      const response = await axios.post(`${url}/api/food-items/add`, formData);

      if (response.data.success) {
        toast.success(response.data.message);
        setData({
          name: '',
          description: '',
          price: '',
          category: ''
        });
        setImage(false);
      } else {
        toast.error(response.data.message);
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add">
      <form className="flex-col" onSubmit={onSubmitHandler}>
        
        {/* Image Upload */}
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img 
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt="Upload Preview"
            />
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files[0])}
            required
          />
        </div>

        {/* Product Name */}
        <div className="add-product-name flex-col">
          <p>Product Name</p>
          <input
            type="text"
            name="name"
            placeholder="Type Here"
            value={data.name}
            onChange={onChangeHandler}
            required
          />
        </div>

        {/* Product Description */}
        <div className="add-product-description flex-col">
          <p>Product Description</p>
          <textarea
            name="description"
            rows="6"
            placeholder="Write Content Here"
            value={data.description}
            onChange={onChangeHandler}
          ></textarea>
        </div>

        {/* Category & Price */}
        <div className="add-category-price flex-col">

          {/* Category Dropdown */}
          <div className="add-category flex-col">
            <p>Category</p>
            <select
              name="category"
              value={data.category}
              onChange={onChangeHandler}
              required
            >
              <option value="" disabled>Select category</option>
              <option value="burger">Burger</option>
              <option value="pizza">Pizza</option>
              <option value="salad">Salad</option>
              <option value="drink">Drink</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>

          {/* Product Price */}
          <div className="add-price flex-col">
            <p>Product Price</p>
            <input
              type="number"
              name="price"
              placeholder="BDT20"
              value={data.price}
              onChange={onChangeHandler}
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="add-product-btn" disabled={loading}>
          {loading ? 'Adding...' : 'ADD'}
        </button>
      </form>
    </div>
  );
};

export default Add;
