import express from "express";
import http from 'http';
import { Server } from 'socket.io';
import { DroneViolations } from "./DroneViolations";

// Fetches and precesses data.
const processor = new DroneViolations

setInterval(processor.updateDroneList , 2000)

const app = express();

// Server handling
const httpServer = http.createServer(app);

// Start the Socket
const io = new Server(httpServer, {
  cors: {
      origin: "*",
      methods: ["GET"]  
  }
});

// Send violation list to clients every 1 seconds.
io.on('connection', client => {
  setInterval(() => {
      client.emit('receive_data', processor.getViolations) 
  }, 1000);
});


// Sends the first list, when someone connects to website
app.get('', (req, res, next) => {
    return res.status(200).json(JSON.stringify(processor.getViolations));
});


// Handles erros
app.use((req, res, next) => {
    const error = new Error('Not found');

    res.status(404).json({
        message: error.message
    });
});

// Starts the server
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => console.info(`Server is running ${PORT}`));