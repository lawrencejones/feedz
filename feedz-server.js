#!/usr/bin/env node
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');

class FeedzServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = require('socket.io')(this.server);
    this.messages = [];

    this.configureApp();
    this.configureIo();
  }

  listen(port) {
    this.server.listen(port);
  }

  configureApp() {
    this.app.use(morgan('dev'));
    this.app.use(bodyParser.json({type: 'application/json'}));
    this.app.post('/broadcast', (req, res) => {
      this.broadcastMessage({
        from: req.body.from,
        content: req.body.content,
      });
      res.json({message:'received'});
    });
  }

  configureIo() {
    this.io.on('connection', (socket) => {
      console.log(`New connection from ${socket.request.connection.remoteAddress}`);
    });
  }

  broadcastMessage(message) {
    console.log(`Broadcasting message: ${JSON.stringify(message)}`);
    this.messages.push(message);
    this.io.sockets.emit('message', message);
  }
}

const PORT = process.env.PORT || 45456;
console.log(`Starting server on port ${PORT}`)
server = new FeedzServer();
server.listen(PORT)
