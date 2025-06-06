import React from 'react'
import './Home.css'
import {assets} from '../../assets/assets'

import Header from '../../components/Header/header'
import ExploreMenu from '../../components/ExplorMenu/ExploreMenu'

const Home = () => {
  return (
    <div>
      <Header/>
      <ExploreMenu/>
    </div>
  )
}

export default Home
