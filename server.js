"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const port = 1234;
const wss = new ws_1.WebSocketServer({ port });
wss.on('connection', (ws) => {
    ws.on('message', (data => {
        console.log(data);
    }));
    ws.send('Hello, this is server.ts');
});
console.log('Listening at ' + port);
