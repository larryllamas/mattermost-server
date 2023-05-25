// remove_paths.js
// Usage node remove_paths.js bin dist node_modules package-lock.json
const fs = require('fs');
const path = require('path');

const pathsToRemove = process.argv.slice(2);

function removePathRecursively(target) {
  if (!fs.existsSync(target)) {
    // console.log(`Skipping removal of nonexistent path: ${target}`);
    return;
  }

  try {
    if (fs.lstatSync(target).isDirectory()) {
      fs.readdirSync(target).forEach(file => {
        const curPath = path.join(target, file);
        removePathRecursively(curPath);
      });

      fs.rmSync(target, { recursive: true, force: true });
    } else {
      fs.rmSync(target, { force: true });
    }
  } catch (error) {
    console.error(`Error removing ${target}: ${error.message}`);
  }
}

pathsToRemove.forEach(removePathRecursively);
