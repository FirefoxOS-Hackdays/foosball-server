var WebSocket = require('ws');

var socket = new WebSocket('ws://localhost:8081');

socket.on('open', function () {

  socket.send(JSON.stringify({
    action: 'create-game'
  }));
});

socket.on('message', function (message) {
  message = JSON.parse(message);

  console.log(message);
});