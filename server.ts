import express from "express";
import http from 'http';
import {Socket, Server } from 'socket.io';
import { dataProcessing } from "./dataProcessing";

// Fetches and precesses data.
let processor = new dataProcessing

setInterval(processor.updateDroneList , 2000)

const app = express();

// Server handling
const httpServer = http.createServer(app);

// Start the Socket
const io = new Server(httpServer, {
  cors: {
      origin: "http://localhost:3000",
      methods: ["GET"]  
  }
});

// Send violation list to clients every 1 seconds.
io.on('connection', client => {
  setInterval(() => {
      client.emit('receive_data', processor.getViolations) 
  }, 1000);
});


/** Rules of our API */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    next();
});

// Sends the first list, when someone connects to website
app.get('', (req, res, next) => {
    return res.status(200).json(processor.getViolations);
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