const fetch = require('node-fetch')
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const port = 1883
const exec = require('child_process').exec;
server.listen(port, function () {
  console.log('server started and listening on port ', port)
})

// ref: https://github.com/moscajs/aedes/blob/master/examples/clusters/index.js

aedes.on('subscribe', function (subscriptions, client) {
  // console.log('MQTT client \x1b[32m' + (client ? client.id : client) + '\x1b[0m subscribed to topics: ' + subscriptions.map((s) => s.topic).join('\n'), 'from broker', aedes.id)
})

aedes.on('unsubscribe', function (subscriptions, client) {
  // console.log('MQTT client \x1b[32m' + (client ? client.id : client) + '\x1b[0m unsubscribed to topics: ' + subscriptions.join('\n'), 'from broker', aedes.id)
})

// fired when a client connects

aedes.on('client', function (client) {
  // console.log('Client Connected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
})

// fired when a client disconnects

aedes.on('clientDisconnect', function (client) {
  // console.log('Client Disconnected: \x1b[31m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
})

// fired when a message is published

aedes.on('publish', async (packet, client) => {
  if (packet.topic === 'server/people-count') {
    let data = packet.payload.toString()

    fetch('http://localhost:3000/api/mqtt', {
      method: 'post',
      body: data,
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.text())
  }
  // console.log('Client \x1b[31m' + (client ? client.id : 'BROKER_' + aedes.id) + '\x1b[0m has published', packet.payload.toString(), 'on', packet.topic, 'to broker', aedes.id)
})

setInterval(() => {
  exec('python ./python/mqtt-serve.py ', function (error, stdout, stderr) {
    if (stdout.length > 1) {
      console.log('you offer args:', stdout);
    } else {
      console.log('you don\'t offer args');
    }
    if (error) {
      console.info('stderr : ' + stderr);
    }
  });
}, 5000)