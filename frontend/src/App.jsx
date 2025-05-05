import React from 'react'
import Navbar from './components/Navbar/Navbar'
import './App.css'
import { Routes } from 'react-router-dom'


const App = () => {
  return (
    <div className='app'>
      <Navbar />
      {/* <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/placeorder' element={<PlaceOrder />} />
      </Routes> */}
      
    </div>
  )
}

export default App
