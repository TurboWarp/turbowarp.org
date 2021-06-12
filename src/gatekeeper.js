const fs = require('fs');
const path = require('path');

const blocklistPath = path.join(__dirname, '..', 'blocklist.json');
let blocklist = {};
if (fs.existsSync(blocklistPath)) {
  blocklist = JSON.parse(fs.readFileSync(blocklistPath, 'utf-8'));
}

const getBlocked = (id) => {
  if (Object.prototype.hasOwnProperty.call(blocklist, id)) {
    return blocklist[id];
  }
  return false;
};

module.exports = getBlocked;
