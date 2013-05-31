var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 8081});

console.log('starting node.js server...');

wss.on('connection', function(ws) {
  console.log('client connected');

  ws.on('message', function (message) {
    console.log('received message', message);
  });

  ws.on('close', function () {
    console.log('client disconnected');
  });
});