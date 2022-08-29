const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');

module.exports = {
  logsDir: path.join(homedir, 'tote-ui', 'logs'),
  fileName: 'MicroTubes.tsv',
  async createFile(headers) {
    if (this.ws) this.clear();
    await this._createDir();
    this.fileName = `MicroTubes_${await this._getFileID()}.tsv`;
    this.filePath = path.join(this.logsDir, this.fileName);
    this.ws = fs.createWriteStream(this.filePath);
    this.ws.write(headers.concat('\n').join('\t'), 'binary');
  },
  writeRow(row) {
    if (!this.ws) return;
    this.ws.write(row.concat('\n').join('\t'), 'binary');
  },
  saveFile(dir, cb) {
    fs.copyFile(this.filePath, path.join(dir, this.fileName), (err) => {
      if (err) {
        console.error(err);
        cb(err);
      } else {
        console.info('Log was written to', this.fileName);
        cb();
      }
    });
  },
  clear() {
    this.ws.end();
    this.ws = null;
  },
  async _getFileID() {
    const logs = await fs.promises.readdir(this.logsDir);
    return logs.reduce((id, fn) => Math.max(+fn.match(/\d+/)[0], id), 0) + 1;
  },
  async _createDir() {
    try {
      await fs.promises.access(this.logsDir);
    } catch {
      await fs.promises.mkdir(this.logsDir, { recursive: true });
    }
  },
};
