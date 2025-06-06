import React, { useState } from 'react'
import './Home.css'
import {assets} from '../../assets/assets'


import ExploreMenu from '../../components/ExplorMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'

const Home = () => {

  const [category, setCategory]= useState("All");

  return (
    <div>
      
      <ExploreMenu category={category} setCategory={setCategory}/>
      <FoodDisplay category={category}/>




    </div>
  )
}

export default Home
