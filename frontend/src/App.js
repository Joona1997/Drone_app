import React, { useState } from 'react'
import Violations from './components/Violations'
import io from 'socket.io-client'
import { useEffect } from 'react'
import Popup from './components/Popup'

// Connect to the socket
const socket = io('localhost:3001', {
  transports: ['websocket', 'polling']
});

  
const App = () => {

  // Shows the popup
  const [buttonPopup, setButtonPopup] = useState(false)
  // Stores the violation data for the popup
  const [popupData, setPopupData] = useState()
  // Stores the modified time for the popup
  const [popupTime, setPopupTime] = useState()
 
  // Stores all the violation data
  var [violations, setData] = useState(new Map());
 
  // Receives initial violation data from the server and stores it in the useState
  useEffect(() => {
    socket.on("initialViolations", (violationString) => {
      const violation = new Map(JSON.parse(violationString));
      setData(violations = violation)
    })
  }, [socket]);

  // Receives new violations from server and stores them in the useState
  useEffect(() => {
    socket.on("newViolation", (violation) => {
      setData(new Map(violations.set(violation.serialNumber, violation)))
    })
  }, [socket]);

  // Receives updated violations from the server
  useEffect(() => {
    socket.on("update", (violation) => {
      setData(new Map(violations.set(violation.serialNumber, violation)))
    })
  }, [socket]);

  // Receives violations that need to be deleted and deletes them
  useEffect(() => {
    socket.on("delete", (violation) => {
      violations.delete(violation.serialNumber, violation)
    })
  }, [socket]);

  return (
    <div className='flex-container'>
      <h1 >Violation Data:</h1>
      
      <div className='list'>
      {[...violations.values()]
        .sort((a, b) => a.lastSeen - b.lastSeen)
          .map(value => <Violations key={value.pilotId} 
                                    violation={value} 
                                    setTrigger={setButtonPopup} 
                                    setData={setPopupData} 
                                    setTime={setPopupTime}/>)}
      </div>
      <Popup trigger={buttonPopup}
       data={popupData} 
       setTrigger={setButtonPopup} 
       time={popupTime}>
       </Popup>
    </div>
  )
}

export default App