import React, { useState } from 'react'
import Violations from './components/Violations'
import io from 'socket.io-client'
import { useEffect } from 'react'
import Canvas from './components/Canvas'

// Connect to the socket
const socket = io('https://drone-violations-app.herokuapp.com/', {
  transports: ['websocket', 'polling']
});


const App = () => {
 
  // Stores the violation data
  var [violations, setData] = useState([]);

  
  // Receives violation data from the server and stores it in the useState
  useEffect(() => {
    socket.on("receive_data", (violationString) => {
      const violation = JSON.parse(violationString);
      setData( violation)
    })
  }, [socket]);

  return (
    <div className='flex-container'>
      <h1>Violation Data:</h1>
      <div className='list'>
        {violations.map((violation) => <Violations key={violation.pilotId} violation={violation} />)}
      </div>
      <div className='item-3'></div>
    </div>
  )
}

export default App