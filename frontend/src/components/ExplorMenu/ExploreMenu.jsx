import React from 'react'
import './ExploreMenu.css'
import {menu_list} from '../../assets/assets'

const ExploreMenu = () => {
  return (
    <div className='explore-menu' id='explore-menu'>
        <h1>Explore Homes</h1>
        <p className='explore-menu-text'>Choose your items and enjoy eating bitch fuck you</p>
        <div className="explore-menu-list">
            {menu_list.map((item,index)=>{
                return (
                    <div key={index} className='explore-menu-list-item'>
                        <img src={item.menu_image} alt="" />
                        <p>{item.menu_name}</p>
                    </div>
                )
            })}
        </div>
    </div>
  )
}

export default ExploreMenu
