import React, { useState } from 'react';
import Canvas from './Canvas.js'
import '../styles.css';


function Violations ({violation})  {
  // Shows map
  const [expanded, setExpanded] = useState(false);

  // Makes the date nicer
  let time = new Date(violation.lastSeen)
  time = time.toLocaleString()
  
  
  return (
    <li className={expanded ? 'item expanded' : 'item'} onClick={() => setExpanded(!expanded)}>
      <div>{violation.firstName} {violation.lastName}</div>
      <div>Last seen: {time}</div>
      <div>Closest distance: {violation.distance} meters</div>
      <div>Phone number: {violation.phoneNumber}</div>
      <div>Email: {violation.email}</div>
      {expanded && (
        <div>
          <div>Cordinates: ({violation.positionX}, {violation.positionY})</div>
          <div><Canvas violation={violation}/></div>
        </div>
        
      )}
    </li>
  );
    
  
}

export default Violations
