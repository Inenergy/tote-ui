const EventEmitter = require('events');
const { randInt } = require('./numagic');
const { DATA } = require('../constants');

const generator = new EventEmitter();
let data = JSON.parse(JSON.stringify(DATA));
for (let key in data) data[key] = randInt(0, 100);
data.gasConcentration = 1100;

function updateData(d) {
  for (let key in data) data[key] += randInt(-5, 5);
}

setInterval(emitValues, 1000);

function emitValues() {
  updateData(data);
  generator.emit('data', data);
}

generator.sendCommand = console.log.bind(console, 'Recieved command:');

module.exports = generator;
