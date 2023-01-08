import React from 'react'
import '../styles.css'
import Canvas from './Canvas'

// A popup window that shows pilot data and a map location of the closest distance.
function Popup({trigger, data, setTrigger, time}) {
     
    return (trigger) ? (
        <div className="popup">
            <div className='popup-inner'>
                <button className="close-btn" onClick={() => {setTrigger(false)}}>
                    x
                </button>
                <div className='popup-components'>
                    <div className='popup-list'>
                        <div>{data.firstName} {data.lastName}</div>
                        <div>Last seen: {time}</div>
                        <div>Closest distance: {data.distance} meters</div>
                        <div>Phone number: {data.phoneNumber}</div>
                        <div>Email: {data.email}</div>
                    </div>
                    <div >
                        <div>Cordinates: ({data.positionX}, {data.positionY})</div>
                        <div className='map'><Canvas violation={data}/></div>
                    </div>
                </div>
            </div>
        </div>
    ) : "";
}

export default Popup