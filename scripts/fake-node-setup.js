const fs = require('fs');

const packageName = 'mattermost-server';
const lockFilePath = './yarn.lock';
const targetVersion = require('../package.json').dependencies[packageName].split('#v')[1];

function updateVersion(lines, index) {
  const regex = new RegExp(`(${packageName}@github:[^#]+)#v(\\d+\\.\\d+\\.\\d+)`);
  const match = lines[index].match(regex);

  if (match) {
    const version = match[2];
    const versionLine = lines[index + 1];
    const currentVersion = versionLine.match(/version "(\d+\.\d+\.\d+)"/)[1];

    if (currentVersion === targetVersion) {
      console.log(`Package '${packageName}' is already updated to version '${targetVersion}'.`);
      return true;
    }

    const updatedVersionLine = versionLine.replace(`version "${currentVersion}"`, `version "${version}"`);

    if (updatedVersionLine !== versionLine) {
      console.log(`Updating version for ${packageName} to ${version}`);
      lines[index + 1] = updatedVersionLine;
      return true;
    }
  }

  return false;
}

fs.readFile(lockFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file '${lockFilePath}':`, err);
    return;
  }

  const lines = data.split('\n');
  let updated = false;

  for (let i = 0; i < lines.length; i++) {
    if (updateVersion(lines, i)) {
      updated = true;
      break;
    }
  }

  if (!updated) {
    console.log(`No matching package '${packageName}' with version '0.0.0' found.`);
    return;
  }

  const updatedContent = lines.join('\n');

  fs.writeFile(lockFilePath, updatedContent, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing file '${lockFilePath}':`, err);
      return;
    }
    console.log('Updated yarn.lock successfully.');
  });
});

let content = '{"name": "' + packageName + '","version": "' + targetVersion + '"}';
fs.writeFile(`./node_modules/${packageName}/package.json`, content, function (err) {
	if (err) throw err;
	console.log(`Created ./node_modules/${packageName}/package.json with content:`, content);
});
