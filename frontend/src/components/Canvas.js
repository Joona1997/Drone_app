import React, { useRef, useEffect } from 'react'
import MyImage from '../images/MapPick.JPG';


// Draws the map and the closest distance dots on the map.
const Canvas = props => {
  const canvasRef = useRef(null)
  var violation = props.violation
  
  useEffect(() => {
    var canvas = canvasRef.current
    var c = canvas.getContext('2d')
    canvas.width = 250
    canvas.height = 250
    
    // Loads the map image
    var img = new Image();
    img.src = MyImage;
    
    // Draws the map over and over
    function animate() {
        
      c.drawImage(img, 300, 110, 700, 700, 0, 0, 250, 250)

      // Makes the circle
      c.strokeStyle = "yellow";
      c.beginPath();
      c.arc(125, 125, 50, 0, 2 * Math.PI);
      c.stroke();

      // Makes the dot
      const x = violation.positionX / 2 
      const y = canvas.height - violation.positionY / 2 
      c.strokeStyle = "red";
      c.beginPath();
      c.arc(x, y, 1, 0, 2 * Math.PI);
      c.stroke();
      
      window.requestAnimationFrame(animate)
    }
  
    animate()
  });

  return <canvas ref={canvasRef} {...props}/>
}

export default Canvas