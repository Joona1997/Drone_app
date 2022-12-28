import express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
import { DroneViolations } from "./DroneViolations";


const app = express();

// Server handling
const httpServer = http.createServer(app);

app.use(express.static('build'))

// Start the Socket
const io = new Server(httpServer, {
  cors: {
      origin: "*",
      methods: ["GET"]  
  }
});

// Fetches and processes data.
const processor = new DroneViolations(io)

// Updates list every 2 seconds
setInterval(processor.updateDroneList , 2000)

// Sends the current list of violations to new connections
io.on("connection", (socket) => {
    socket.emit('initialViolations', processor.getViolations)
})

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
