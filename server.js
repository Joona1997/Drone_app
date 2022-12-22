"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const socket_io_1 = require("socket.io");
const DroneViolations_1 = require("./DroneViolations");
// Fetches and precesses data.
const processor = new DroneViolations_1.DroneViolations;
setInterval(processor.updateDroneList, 2000);
const app = (0, express_1.default)();
// Server handling
const httpServer = http.createServer(app);
// Start the Socket
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET"]
    }
});
// Send violation list to clients every 1 seconds.
io.on('connection', client => {
    setInterval(() => {
        client.emit('receive_data', processor.getViolations);
    }, 1000);
});
// Sends the first list, when someone connects to website
app.get('/', (req, res, next) => {
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
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.info(`Server is running ${PORT}`));
