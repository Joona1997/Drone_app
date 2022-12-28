import React from 'react';
import '../styles.css';


// List component, shows one violation data.
// When clicked, opens a popup window.
function Violations ({setTrigger, setData, setTime, violation})  {

  // Makes the date nicer
  let time = new Date(violation.lastSeen)
  time = time.toLocaleString()
 
  return (
    <li className={'item'} onClick={() => {setTrigger(true); setData(violation); setTime(time)} }>
      <div>{violation.firstName} {violation.lastName}</div>
      <div>Last seen: {time}</div>
      <div>Closest distance: {violation.distance} meters</div>
      <div>Phone number: {violation.phoneNumber}</div>
      <div>Email: {violation.email}</div>
    </li>
  );
    
  
}
export default Violations
