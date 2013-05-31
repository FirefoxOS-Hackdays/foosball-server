var WebSocket = require('ws');

var socket = new WebSocket('ws://localhost:8081');

var gameToken = process.argv[2];

socket.on('open', function () {

  socket.send(JSON.stringify({
    action: 'join-game',
    token: gameToken
  }));
});

socket.on('message', function (message) {
  message = JSON.parse(message);

  console.log(message);
});