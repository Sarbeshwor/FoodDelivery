import React, { useState } from 'react'
import './Home.css'
import {assets} from '../../assets/assets'


import ExploreMenu from '../../components/ExplorMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import Header from '../../components/Header/header'
import AppDownload from '../../components/AppDownload/AppDownload'

const Home = () => {

  const [category, setCategory]= useState("All");

  return (
    <div>
      <Header />
      <ExploreMenu category={category} setCategory={setCategory}/>
      <FoodDisplay category={category}/>
      <AppDownload/>
    </div>
  )
}

export default Home
