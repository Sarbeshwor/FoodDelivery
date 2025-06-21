import React from 'react'
import './header.css'


const header = () => {
  return (
    <div className='header'>
      <div className="header-contents">
        <h2>
          Order Food Online
        </h2>
        <p>Choose your local restaurant and enjoy the food</p>
        
      </div>
      <div className="buttons">
        <button>View Menu</button>
      </div>
    </div>

  )
}

export default header
