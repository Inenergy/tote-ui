const path = require('path');
const url = require('url');
const electron = require('electron');
const logger = require('./utils/logger');
const usbPort = require('./utils/usbPort');
const { app, BrowserWindow, ipcMain } = electron;
const { DATA } = require('./constants');
const { exec } = require('child_process');
const checkUpdate = require('./utils/updater');

let win, serial, usbPath, updateAvailable;

let initialData = JSON.parse(JSON.stringify(DATA));
for (let key in initialData) initialData[key] = 0;

const mode = process.env.NODE_ENV;
const isPi = process.platform === 'linux' && process.arch === 'arm';

function reloadOnChange(win) {
  if (mode !== 'development' && mode !== 'test') return { close: () => {} };

  const watcher = require('chokidar').watch(path.join(__dirname, '**'), {
    ignoreInitial: true,
  });

  watcher.on('change', () => {
    win.reload();
    initPeripherals();
  });

  return watcher;
}

function initPeripherals() {
  removeListeners();
  serial = require(`./utils/${isPi ? 'serial' : 'DataGenerator'}`);
  addPeripheralsListeners();
  listenRenderer();
  initUpdater();
}

function initUpdater() {
  checkUpdate().then((isUpdatable) => {
    if (isUpdatable) win.webContents.send('updateAvailable');
    updateAvailable = isUpdatable;
  });
  ipcMain.on('checkUpdate', (e) => (e.returnValue = updateAvailable));
  ipcMain.on('updateProgramm', () =>
    exec('~/tote-ui/scripts/update.sh', (err) => {
      if (err) console.error(err.message);
    })
  );
}

function listenRenderer() {
  ipcMain.on('serialCommand', (e, cmd) => serial.sendCommand(cmd));
  ipcMain.on('initialDataRequest', (e) => (e.returnValue = initialData));
  ipcMain.on('saveFile', (e) =>
    logger.saveFile(usbPath, e.reply.bind(e, 'fileSaved'))
  );
  ipcMain.on('logRow', (e, row) => logger.writeRow(row));
  ipcMain.on('startLog', (e, headers) => logger.createFile(headers));
  ipcMain.on('clearLog', logger.clear);
  ipcMain.on('usbStorageRequest', usbPort.init);
  ipcMain.on('ejectUSB', usbPort.eject);
}

function removeListeners() {
  serial && serial.removeAllListeners();
  ipcMain && ipcMain.removeAllListeners();
  usbPort && usbPort.removeAllListeners();
}

function addPeripheralsListeners() {
  serial.on('data', (data) => win.webContents.send('serialData', data));
  serial.once('data', (data) => (initialData = data));
  usbPort.on('add', (dev) => {
    usbPath = dev;
    win.webContents.send('usbConnected');
  });
  usbPort.on('remove', (dev) => {
    usbPath = dev;
    win.webContents.send('usbDisconnected');
  });
}

function launch() {
  const screenArea = electron.screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    width: isPi ? screenArea.width : 1280,
    height: isPi ? screenArea.height : 800,
    fullscreen: isPi,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, '../static/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  initPeripherals();

  const watcher = reloadOnChange(win);

  win.on('closed', function () {
    removeListeners();
    win = null;
    watcher.close();
  });
}

app.on('ready', launch);
