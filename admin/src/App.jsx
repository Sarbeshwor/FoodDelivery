import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Slidebar from './components/Slidebar/Slidebar'

const App = () => {
  return (
    <div>
      <Navbar />
      <hr/>
      <div className="app-content">
        <Slidebar />
      </div>
    </div>
  )
}

export default App