import React, { useState, useEffect } from 'react'
import './Add.css'
import { assets } from '../../assets/assets'
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = () => {

  const url = 'http://localhost:5000';
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: '',
    price: '',
    category: 'burger'
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({
      ...data,
      [name]: value
    }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image) return toast.error("Please upload an image");

    const formData = new FormData();
    formData.append('image', image);
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('category', data.category);

    try {
      const response = await axios.post(`${url}/api/food/add`, formData);
      if (response.data.success) {
        setData({
          name: '',
          description: '',
          price: '',
          category: 'burger'
        });
        setImage(false);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(response.data.message || "Something went wrong");
    }
  }

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div>
      <div className="add">
        <form className="flex-col" onSubmit={onSubmitHandler}>
          <div className='add-img-upload flex-col'>
            <p>Upload Image</p>
            <label htmlFor="image">
              <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
            </label>
            <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden required />
          </div>
          <div className="add-product-name flex-col"> 
            <p>Product Name</p>
            <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type Here'/>
          </div>
          <div className="add-product-description flex-col">
            <p>Product Description</p>
            <textarea onChange={onChangeHandler} value={data.description} name='description' rows="6" placeholder='Write Content Here'></textarea>
          </div>
          <div className="add-category-price flex-col">
            <div className="add-category flex-col">
              <select onChange={onChangeHandler} name="category" id="category" value={data.category}>
                <option value="burger">Burger</option>
                <option value="pizza">Pizza</option>
                <option value="salad">Salad</option>
                <option value="drink">Drink</option>
                <option value="dessert">Dessert</option>
              </select>
            </div>
            <div className="add-price flex-col">
              <p>Product Price</p>
              <input onChange={onChangeHandler} value={data.price} type="number" name='price' placeholder='BDT20' />
            </div>
          </div>
          <button type='submit' className='add-product-btn'>ADD</button>
        </form> 
      </div> 
    </div>
  )
}

export default Add;
