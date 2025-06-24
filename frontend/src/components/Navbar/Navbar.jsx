import React, { useContext, useState } from 'react'
import './Navbar.css'
import {assets}from '../../assets/assets'
import {Link} from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'

const Navbar = ({setShowLogin}) => {

  const [menu,setMenu] = useState("Menu")
  
  
  const {getTotalCartAmount , user} = useContext(StoreContext)

  return (
    <div className='navbar'>
        <Link to='/'><img src={assets.logo} alt="" className="logo" /></Link>
        <ul className="navbar-menu">
            <Link to='/' onClick={()=>setMenu("Home")} className={menu=="Home"?"active":""}>Home</Link>
            <a href='#explore-menu' onClick={()=>setMenu("Menu")} className={menu=="Menu"?"active":""}>Menu</a>
            <a href='#app-download' onClick={()=>setMenu("Stories")} className={menu=="Stories"?"active":""}>Stories</a>
            <a href='#footer' onClick={()=>setMenu("Contact us")} className={menu=="Contact us"?"active":""}>Contact us</a>
        </ul>
        <div className="navbar-right">
            <img src={assets.search_icon} alt="" />
            <div className="navbar-search-icon">
                <Link to='/cart'><img src={assets.basket_icon} alt="" /></Link>
                <div className={getTotalCartAmount()===0?"":"dot"}></div>
            </div>
                {user ? (
             <img src={assets.user_img} alt="" className='user_img'/>

            ): (<button onClick={()=>setShowLogin(true)}>
                  {user ? user.username : "sign in"}
                </button>)}
                
            
        </div>
    </div>
  )
}

export default Navbar
