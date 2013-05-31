var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8081 });

console.log('starting node.js server...');

var App = new function () {
  var games = {};

  this.createGame = function (board) {
    var game = new Game(board);
    games[game.token] = game;
    return game;
  };

  this.findGame = function (token) {
    if (!games[token]) {
      throw new Error('Game not found');
    }
    return games[token];
  };

  this.finishGame = function (token) {
    games[token].finish();
    games[token] = null;
  };

};

var Game = function (board) {
  this.MAX_PLAYERS = 4;

  this.token = Math.floor(Math.random()*9000) + 1000;

  this.players = Array.apply(null, new Array(this.MAX_PLAYERS));
  console.log(this.players);
  this.board = board;

  this.sendToBoard(JSON.stringify({
    action: 'game-created',
    token: this.token
  }));
};

Game.prototype.addPlayer = function (ws) {
  var playerNum = null;
  this.players.forEach(function (el, i) {
    if (!playerNum && !el) {
      playerNum = i;
    }
  });

  if (playerNum === null) {
    throw new Error('Maxium number of players reached');
  }

  this.players[playerNum] = ws;

  var message  = JSON.stringify({
    action: 'player-joined',
    playerNum: playerNum
  });

  ws.send(message);
  this.sendToBoard(message);

  return playerNum;
};

Game.prototype.removePlayer = function (playerNum) {
  this.players[playerNum] = null;

  this.sendToBoard(JSON.stringify({
    action: 'player-left',
    playerNum: playerNum
  }));
};

Game.prototype.sendToBoard = function (message) {
  if (this.board) {
    this.board.send(JSON.stringify(message));
  }
};

Game.prototype.finish = function () {
  this.players.forEach(function (ws) {
    if (ws) {
      ws.send(JSON.stringify({
        action: 'game-finished'
      }));
    }
  });
  this.board = null;
};

wss.on('connection', function(ws) {
  console.log('client connected');
  var game = null;
  var board = false;
  var playerNum = null;

  ws.on('message', function (message) {
    console.log('received message', message);

    try {
      message = JSON.parse(message);

      if (message.action === 'join-game') {
        game = App.findGame(message.token);
        playerNum = game.addPlayer(ws);
      }

      if (message.action === 'create-game') {
        game = App.createGame(ws);
        board = true;
      }

      if (message.action === 'slide' || message.action === 'shoot') {
        message.playerNum = playerNum;
        game.sendToBoard(message);
      }
    } catch (error) {
      console.log(error.message);
      ws.send(JSON.stringify({ error: error.message }));
    }
  });

  ws.on('close', function () {
    if (board) {
      App.finishGame(game.token);
    } else if (game) {
      game.removePlayer(playerNum);
    }
  });
});