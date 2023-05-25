// Script works if your compiling on same Ubuntu OS as the component glibc wise which is Ubuntu 20.04.  
// Use the docker based approach to build from any OS via `yarn build-custom-mattermost`
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const mattermostServerPath = path.join(__dirname, '..', "node_modules", "mattermost-server");
const targetPath = path.join(__dirname, '..', "target");

// Create the target directory if it doesn't exist
if (!fs.existsSync(targetPath)) {
  fs.mkdirSync(targetPath);
}

// Function to format bytes into human-readable format
function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

// Change the current working directory to mattermost-server
process.chdir(mattermostServerPath);

// Run the 'make build-linux' command
exec("make build-linux", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }

  // Rename and move the binary executable
  const originalBinaryPath = path.join(mattermostServerPath, "bin", "mattermost");
  const renamedBinaryPath = path.join(targetPath, "mattermost-custom-binary");

  fs.rename(originalBinaryPath, renamedBinaryPath, (err) => {
    if (err) {
      console.error(`Error renaming and moving binary: ${err.message}`);
    } else {
      console.log("Successfully renamed 'mattermost' to 'mattermost-custom-binary' and moved the binary executable to target/mattermost-custom-binary.");
	  // Output the binary size
	  const binarySize = fs.statSync(renamedBinaryPath).size;
	  console.log(`target/mattermost-custom-binary Binary size: ${formatBytes(binarySize)}`);

	  // Calculate and output the SHA256 checksum
	  const sha256Hash = crypto.createHash("sha256");
	  const fileStream = fs.createReadStream(renamedBinaryPath);
	  fileStream.on("data", (chunk) => {
		sha256Hash.update(chunk);
	  });

	  fileStream.on("end", () => {
		const sha256Sum = sha256Hash.digest("hex");
		console.log(`target/mattermost-custom-binary SHA256 checksum: ${sha256Sum}`);
	  });

	  fileStream.on("error", (streamErr) => {
		console.error(`Error reading binary for SHA256 calculation: ${streamErr.message}`);
	  });
    }
  });
});
