import React from 'react'
import './Home.css'
import {assets} from '../../assets/assets'

import Header from '../../components/Header/Header'
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
