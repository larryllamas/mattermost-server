const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const source = path.join(__dirname, '..', "node_modules", 'mattermost-server', 'bin', 'mattermost');
const destination = path.join(__dirname, '..', 'target', 'mattermost-custom-binary');

function humanReadableSize(size) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function sha256sum(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(file);

    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

fs.promises.mkdir('target', { recursive: true })
  .then(() => fs.promises.copyFile(source, destination))
  .then(() => Promise.all([fs.promises.stat(destination), sha256sum(destination)]))
  .then(([stats, sha256]) => {
    const fileSize = humanReadableSize(stats.size);
    console.log(`Copied file: ${destination}`);
    console.log(`File size: ${fileSize}`);
    console.log(`SHA-256: ${sha256}`);
  })
  .catch(error => {
    console.error(`Error: ${error.message}`);
  });
