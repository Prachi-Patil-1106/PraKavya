const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'poems.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

function readAll() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeAll(poems) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(poems, null, 2), 'utf-8');
}

module.exports = { readAll, writeAll };
