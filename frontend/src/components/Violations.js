import React, { useState } from 'react';
import Canvas from './Canvas.js'
import '../styles.css';


function Violations ({violation})  {
  const [expanded, setExpanded] = useState(false);
  let time = new Date(violation.lastSeen)
  time = time.toUTCString()
  
  
  return (
    <li className={expanded ? 'item expanded' : 'item'} onClick={() => setExpanded(!expanded)}>
      <div>{violation.firstName} {violation.lastName}</div>
      <div>{time}</div>
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
