const os = require('os');
const fs = require('fs');

const isPi = process.platform === 'linux' && process.arch === 'arm';

// идентификатор серийного порта для raspberry OS и windows
const PORT = {
  name: isPi ? '/dev/ttyS0' : 'COM5',
  baudRate: 230400,
};

// разделители в двоичном виде
const DIVIDERS = Buffer.alloc(4);
DIVIDERS.writeUInt16BE(7581);
DIVIDERS.writeUInt16BE(8887, 2);

// структура, описывающая массив данных с платы управления
const DATA = {
  cellVoltage: {
    label: 'voltage',
    units: 'mV',
    symbol: 'U',

    bytes: 2,
  },
  cellCurrent: {
    label: 'current',
    units: 'mA',
    symbol: 'I',

    bytes: 2,
  },
  fuelConsumption: {
    label: 'fuel consumption',
    units: 'ml/min',

    bytes: 2,
  },
  cellTemp: {
    label: 'cell temperature',
    units: '\u02daC',

    bytes: 2,
  },
  riformerTemp: {
    label: 'temperature',
    units: '\u02daC',

    bytes: 2,
  },
  burnerTemp: {
    label: 'temperature',
    units: '\u02daC',

    bytes: 2,
  },
  setCellTemp: {
    label: 'set cell temperature',
    units: '\u02daC',
    bytes: 2,
  },
  setRiformerTemp: {
    label: 'set riformer temperature',
    units: '\u02daC',
    bytes: 2,
  },
  setBurnerTemp: {
    label: 'set burner temperature',
    units: '\u02daC',
    bytes: 2,
  },
  gasConcentration: {
    bytes: 2,
  },
  riformerAirFlow: {
    label: 'air flow',
    units: '%',

    bytes: 1,
  },
  burnerAirFlow: {
    label: 'air flow',
    units: '%',

    bytes: 1,
  },
  fuel: {
    label: 'fuel',

    bytes: 1,
  },
  cellLoad: {
    label: 'cell power',
    units: '%',

    bytes: 1,
  },
  riformerLoad: {
    label: 'riformer power',
    units: '%',

    bytes: 1,
  },
  burnerLoad: {
    label: 'burner power',
    units: '%',

    bytes: 1,
  },
};

// комманды, функции принимающие значения и возвращающие массив для отправки на МК
const COMMANDS = {
  setFuelType: (v) => [4, v],
  setRiformerFlow: (v) => [8, v],
  setBurnerFlow: (v) => [12, v],
  getIV: () => [16, 0],
  setCellTemp: (v) => [20, (v / 10) | 0],
  switchThermistor: (v) => [24, v],
  setFuelConsumption: (v) => [28, v],
};

// ограничения полей ввода
const CONSTRAINTS = {
  cellTemp: [0, 800],
  fuelConsumption: [0, 250],
};

// чтение сохраненной калибровки датчика водорода
const { CRITICAL_CONCENTRATION } = JSON.parse(
  fs.readFileSync(
    isPi ? `${os.homedir()}/.inenergy/config.json` : `config.json`
  )
);

module.exports = {
  PORT,
  DIVIDERS,
  DATA,
  COMMANDS,
  CONSTRAINTS,
  CRITICAL_CONCENTRATION,
};
