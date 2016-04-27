#!/usr/bin/env node
const request = require('request');
const {spawnSync} = require('child_process');

class FeedzClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  sendMessage(from, content) {
    request({
      method: 'POST',
      url: `${this.endpoint}/broadcast`,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, content }),
    })
      .on('error',    (err) => { console.error(`There was an error ${err}`) })
      .on('response', (res) => { console.log(`Success! [${res.statusCode}]`) })
  }

  startGrowlDaemon() {
    let socket = require('socket.io-client')(this.endpoint);
    socket.on('message', ({from, content}) => {
      spawnSync('growlnotify', [
        '--name', from,
        '--message', content,
      ]);
    });
  }
}

let [command, endpoint, ...args] = process.argv.slice(2);
console.log(`Connecting to server: ${endpoint}`);
let feedz = new FeedzClient(endpoint);

switch(command) {
  case 'message':
    let [from, content] = args
    feedz.sendMessage(from, content);
    break;

  case 'growl':
    feedz.startGrowlDaemon();
    break;
}

